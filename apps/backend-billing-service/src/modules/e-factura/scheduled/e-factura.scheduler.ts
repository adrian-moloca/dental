import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { EFacturaService } from '../e-factura.service';
import { EFacturaConfigType } from '../config/e-factura.config';
import { EFacturaSubmissionStatus } from '../entities/e-factura-submission.schema';

/**
 * Job execution statistics
 */
interface JobExecutionStats {
  lastRunAt?: Date;
  lastRunDurationMs?: number;
  lastRunSuccess?: boolean;
  lastRunProcessedCount?: number;
  lastRunErrors?: string[];
  totalRuns: number;
  totalProcessed: number;
  totalErrors: number;
}

/**
 * E-Factura Scheduler Service
 *
 * Provides automated background processing for E-Factura submissions:
 *
 * 1. **Pending Submission Processor**
 *    - Processes new submissions that are in PENDING status
 *    - Generates XML and submits to ANAF
 *    - Runs every 5 minutes
 *
 * 2. **Status Check Processor**
 *    - Polls ANAF for status updates on submitted invoices
 *    - Updates local records when invoices are signed or rejected
 *    - Runs every 2 minutes
 *
 * 3. **Retry Processor**
 *    - Retries failed submissions that are eligible for retry
 *    - Respects max retry limits and backoff timing
 *    - Runs every 10 minutes
 *
 * 4. **Deadline Monitor**
 *    - Alerts on submissions approaching deadline
 *    - Romanian law requires B2B submissions within 5 working days
 *    - Runs once per hour
 *
 * 5. **Stale Submission Cleanup**
 *    - Marks very old pending submissions as stale
 *    - Runs once per day
 *
 * All jobs are tenant-aware and process submissions across all tenants.
 * Job execution is logged and emits events for monitoring.
 */
@Injectable()
export class EFacturaScheduler implements OnModuleInit {
  private readonly logger = new Logger(EFacturaScheduler.name);

  /** Job execution statistics */
  private jobStats: Record<string, JobExecutionStats> = {
    pendingProcessor: { totalRuns: 0, totalProcessed: 0, totalErrors: 0 },
    statusChecker: { totalRuns: 0, totalProcessed: 0, totalErrors: 0 },
    retryProcessor: { totalRuns: 0, totalProcessed: 0, totalErrors: 0 },
    deadlineMonitor: { totalRuns: 0, totalProcessed: 0, totalErrors: 0 },
    staleCleanup: { totalRuns: 0, totalProcessed: 0, totalErrors: 0 },
  };

  /** Whether scheduler is enabled */
  private isEnabled = true;

  /** Lock to prevent concurrent job execution */
  private jobLocks: Record<string, boolean> = {};

  constructor(
    private readonly eFacturaService: EFacturaService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  onModuleInit(): void {
    const config = this.getConfig();
    this.logger.log('E-Factura Scheduler initialized');
    this.logger.log(`Environment: ${config.anaf.isTestEnvironment ? 'TEST' : 'PRODUCTION'}`);
    this.logger.log(`Batch size: ${config.submission.batchSize}`);
    this.logger.log(`Status check interval: ${config.submission.statusCheckIntervalMs}ms`);
  }

  /**
   * Get E-Factura configuration
   */
  private getConfig(): EFacturaConfigType {
    return this.configService.get<EFacturaConfigType>('efactura')!;
  }

  // ============================================
  // Scheduled Jobs
  // ============================================

  /**
   * Process pending submissions
   * Runs every 5 minutes
   *
   * This job picks up new submissions in PENDING status,
   * generates their XML, and submits them to ANAF.
   */
  @Cron(CronExpression.EVERY_5_MINUTES, {
    name: 'efactura-pending-processor',
  })
  async processPendingSubmissions(): Promise<void> {
    if (!this.isEnabled) return;
    if (this.jobLocks['pendingProcessor']) {
      this.logger.debug('Pending processor already running, skipping');
      return;
    }

    this.jobLocks['pendingProcessor'] = true;
    const startTime = Date.now();
    const stats = this.jobStats['pendingProcessor'];
    stats.totalRuns++;
    stats.lastRunAt = new Date();
    const errors: string[] = [];

    try {
      this.logger.log('Starting pending submissions processor');

      const submissions = await this.eFacturaService.getPendingSubmissions();
      this.logger.log(`Found ${submissions.length} pending submissions to process`);

      if (submissions.length === 0) {
        stats.lastRunSuccess = true;
        stats.lastRunProcessedCount = 0;
        return;
      }

      let processedCount = 0;
      for (const submission of submissions) {
        try {
          // Skip if already being processed
          if (submission.status !== EFacturaSubmissionStatus.PENDING) {
            continue;
          }

          // Create tenant context from submission
          const context = {
            tenantId: submission.tenantId,
            organizationId: submission.organizationId,
            clinicId: submission.clinicId,
            userId: submission.createdBy,
          };

          // Retry the submission (which processes it)
          await this.eFacturaService.retrySubmission(submission._id.toString(), context, {
            force: false,
          });

          processedCount++;
          stats.totalProcessed++;

          this.logger.debug(
            `Processed pending submission ${submission._id} for invoice ${submission.invoiceNumber}`,
          );
        } catch (error) {
          const errorMsg = `Failed to process submission ${submission._id}: ${error instanceof Error ? error.message : String(error)}`;
          this.logger.error(errorMsg);
          errors.push(errorMsg);
          stats.totalErrors++;
        }
      }

      stats.lastRunSuccess = errors.length === 0;
      stats.lastRunProcessedCount = processedCount;
      stats.lastRunErrors = errors.length > 0 ? errors.slice(0, 10) : undefined;

      this.logger.log(
        `Pending processor completed: ${processedCount}/${submissions.length} processed, ${errors.length} errors`,
      );

      // Emit completion event
      this.eventEmitter.emit('efactura.scheduler.pending-processor.completed', {
        processedCount,
        totalCount: submissions.length,
        errorCount: errors.length,
        durationMs: Date.now() - startTime,
      });
    } catch (error) {
      stats.lastRunSuccess = false;
      stats.lastRunErrors = [error instanceof Error ? error.message : String(error)];
      this.logger.error('Pending processor failed', error);
    } finally {
      stats.lastRunDurationMs = Date.now() - startTime;
      this.jobLocks['pendingProcessor'] = false;
    }
  }

  /**
   * Check status of submitted invoices
   * Runs every 2 minutes
   *
   * This job polls ANAF for status updates on invoices that have been
   * submitted but not yet signed or rejected.
   */
  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'efactura-status-checker',
  })
  async checkSubmissionStatuses(): Promise<void> {
    if (!this.isEnabled) return;
    if (this.jobLocks['statusChecker']) {
      this.logger.debug('Status checker already running, skipping');
      return;
    }

    this.jobLocks['statusChecker'] = true;
    const startTime = Date.now();
    const stats = this.jobStats['statusChecker'];
    stats.totalRuns++;
    stats.lastRunAt = new Date();
    const errors: string[] = [];

    try {
      this.logger.debug('Starting status check processor');

      const submissions = await this.eFacturaService.getSubmissionsNeedingStatusCheck();

      if (submissions.length === 0) {
        stats.lastRunSuccess = true;
        stats.lastRunProcessedCount = 0;
        return;
      }

      this.logger.log(`Found ${submissions.length} submissions needing status check`);

      let processedCount = 0;
      let statusChanges = 0;

      for (const submission of submissions) {
        try {
          const previousStatus = submission.status;

          // Check status (this updates the submission internally)
          const result = await this.eFacturaService.checkStatus(submission._id.toString());

          processedCount++;
          stats.totalProcessed++;

          if (result.status !== previousStatus) {
            statusChanges++;
            this.logger.log(
              `Submission ${submission._id} status changed: ${previousStatus} -> ${result.status}`,
            );
          }
        } catch (error) {
          const errorMsg = `Failed to check status for ${submission._id}: ${error instanceof Error ? error.message : String(error)}`;
          this.logger.warn(errorMsg);
          errors.push(errorMsg);
          stats.totalErrors++;
        }

        // Add small delay between ANAF API calls to avoid rate limiting
        await this.sleep(500);
      }

      stats.lastRunSuccess = errors.length === 0;
      stats.lastRunProcessedCount = processedCount;
      stats.lastRunErrors = errors.length > 0 ? errors.slice(0, 10) : undefined;

      if (processedCount > 0) {
        this.logger.log(
          `Status checker completed: ${processedCount} checked, ${statusChanges} status changes, ${errors.length} errors`,
        );
      }

      // Emit completion event
      this.eventEmitter.emit('efactura.scheduler.status-checker.completed', {
        processedCount,
        statusChanges,
        errorCount: errors.length,
        durationMs: Date.now() - startTime,
      });
    } catch (error) {
      stats.lastRunSuccess = false;
      stats.lastRunErrors = [error instanceof Error ? error.message : String(error)];
      this.logger.error('Status checker failed', error);
    } finally {
      stats.lastRunDurationMs = Date.now() - startTime;
      this.jobLocks['statusChecker'] = false;
    }
  }

  /**
   * Retry failed submissions
   * Runs every 10 minutes
   *
   * This job processes ERROR status submissions that are eligible
   * for retry based on nextRetryAt time and retry count.
   */
  @Cron(CronExpression.EVERY_10_MINUTES, {
    name: 'efactura-retry-processor',
  })
  async processRetries(): Promise<void> {
    if (!this.isEnabled) return;
    if (this.jobLocks['retryProcessor']) {
      this.logger.debug('Retry processor already running, skipping');
      return;
    }

    this.jobLocks['retryProcessor'] = true;
    const startTime = Date.now();
    const stats = this.jobStats['retryProcessor'];
    stats.totalRuns++;
    stats.lastRunAt = new Date();
    const errors: string[] = [];

    try {
      this.logger.debug('Starting retry processor');

      // getPendingSubmissions includes ERROR status with nextRetryAt check
      const submissions = await this.eFacturaService.getPendingSubmissions();
      const errorSubmissions = submissions.filter(
        (s) => s.status === EFacturaSubmissionStatus.ERROR,
      );

      if (errorSubmissions.length === 0) {
        stats.lastRunSuccess = true;
        stats.lastRunProcessedCount = 0;
        return;
      }

      this.logger.log(`Found ${errorSubmissions.length} error submissions eligible for retry`);

      let processedCount = 0;
      for (const submission of errorSubmissions) {
        try {
          const context = {
            tenantId: submission.tenantId,
            organizationId: submission.organizationId,
            clinicId: submission.clinicId,
            userId: submission.createdBy,
          };

          await this.eFacturaService.retrySubmission(submission._id.toString(), context, {
            force: false,
          });

          processedCount++;
          stats.totalProcessed++;

          this.logger.log(
            `Retried submission ${submission._id} (attempt ${submission.retryCount + 1})`,
          );
        } catch (error) {
          const errorMsg = `Failed to retry submission ${submission._id}: ${error instanceof Error ? error.message : String(error)}`;
          this.logger.warn(errorMsg);
          errors.push(errorMsg);
          stats.totalErrors++;
        }
      }

      stats.lastRunSuccess = errors.length === 0;
      stats.lastRunProcessedCount = processedCount;
      stats.lastRunErrors = errors.length > 0 ? errors.slice(0, 10) : undefined;

      if (processedCount > 0) {
        this.logger.log(
          `Retry processor completed: ${processedCount}/${errorSubmissions.length} retried, ${errors.length} errors`,
        );
      }

      // Emit completion event
      this.eventEmitter.emit('efactura.scheduler.retry-processor.completed', {
        processedCount,
        totalCount: errorSubmissions.length,
        errorCount: errors.length,
        durationMs: Date.now() - startTime,
      });
    } catch (error) {
      stats.lastRunSuccess = false;
      stats.lastRunErrors = [error instanceof Error ? error.message : String(error)];
      this.logger.error('Retry processor failed', error);
    } finally {
      stats.lastRunDurationMs = Date.now() - startTime;
      this.jobLocks['retryProcessor'] = false;
    }
  }

  /**
   * Monitor submission deadlines
   * Runs every hour
   *
   * Romanian law requires B2B invoices to be submitted within 5 working days.
   * This job identifies submissions approaching or past their deadline.
   */
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'efactura-deadline-monitor',
  })
  async monitorDeadlines(): Promise<void> {
    if (!this.isEnabled) return;
    if (this.jobLocks['deadlineMonitor']) {
      return;
    }

    this.jobLocks['deadlineMonitor'] = true;
    const startTime = Date.now();
    const stats = this.jobStats['deadlineMonitor'];
    stats.totalRuns++;
    stats.lastRunAt = new Date();

    try {
      this.logger.debug('Starting deadline monitor');

      const config = this.getConfig();
      const deadlineHours = config.submission.deadlineHours;
      const warningThresholdHours = deadlineHours * 0.8; // Warn at 80% of deadline

      // Get all non-terminal submissions
      const submissions = await this.eFacturaService.getPendingSubmissions();

      const now = new Date();
      let approachingDeadline = 0;
      let pastDeadline = 0;

      for (const submission of submissions) {
        const createdAt = new Date(submission.createdAt);
        const ageHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

        if (ageHours > deadlineHours) {
          pastDeadline++;
          this.logger.warn(
            `DEADLINE EXCEEDED: Submission ${submission._id} for invoice ${submission.invoiceNumber} ` +
              `is ${Math.round(ageHours)}h old (limit: ${deadlineHours}h)`,
          );

          // Emit deadline exceeded event
          this.eventEmitter.emit('efactura.deadline.exceeded', {
            submissionId: submission._id.toString(),
            invoiceNumber: submission.invoiceNumber,
            ageHours: Math.round(ageHours),
            deadlineHours,
            tenantId: submission.tenantId,
          });
        } else if (ageHours > warningThresholdHours) {
          approachingDeadline++;
          this.logger.warn(
            `DEADLINE WARNING: Submission ${submission._id} for invoice ${submission.invoiceNumber} ` +
              `is ${Math.round(ageHours)}h old (approaching ${deadlineHours}h limit)`,
          );

          // Emit deadline warning event
          this.eventEmitter.emit('efactura.deadline.approaching', {
            submissionId: submission._id.toString(),
            invoiceNumber: submission.invoiceNumber,
            ageHours: Math.round(ageHours),
            deadlineHours,
            hoursRemaining: Math.round(deadlineHours - ageHours),
            tenantId: submission.tenantId,
          });
        }
      }

      stats.lastRunSuccess = true;
      stats.lastRunProcessedCount = submissions.length;
      stats.totalProcessed += submissions.length;

      if (approachingDeadline > 0 || pastDeadline > 0) {
        this.logger.log(
          `Deadline monitor: ${pastDeadline} past deadline, ${approachingDeadline} approaching deadline`,
        );
      }

      // Emit completion event
      this.eventEmitter.emit('efactura.scheduler.deadline-monitor.completed', {
        checkedCount: submissions.length,
        pastDeadline,
        approachingDeadline,
        durationMs: Date.now() - startTime,
      });
    } catch (error) {
      stats.lastRunSuccess = false;
      stats.lastRunErrors = [error instanceof Error ? error.message : String(error)];
      this.logger.error('Deadline monitor failed', error);
    } finally {
      stats.lastRunDurationMs = Date.now() - startTime;
      this.jobLocks['deadlineMonitor'] = false;
    }
  }

  /**
   * Cleanup stale submissions
   * Runs once per day at 3 AM
   *
   * This job marks very old PENDING submissions as stale for manual review.
   */
  @Cron('0 3 * * *', {
    name: 'efactura-stale-cleanup',
  })
  async cleanupStaleSubmissions(): Promise<void> {
    if (!this.isEnabled) return;
    if (this.jobLocks['staleCleanup']) {
      return;
    }

    this.jobLocks['staleCleanup'] = true;
    const startTime = Date.now();
    const stats = this.jobStats['staleCleanup'];
    stats.totalRuns++;
    stats.lastRunAt = new Date();

    try {
      this.logger.log('Starting stale submission cleanup');

      const config = this.getConfig();
      // Consider submissions stale after 2x the deadline
      const staleThresholdHours = config.submission.deadlineHours * 2;
      const staleThreshold = new Date(Date.now() - staleThresholdHours * 60 * 60 * 1000);

      const submissions = await this.eFacturaService.getPendingSubmissions();
      const staleSubmissions = submissions.filter((s) => new Date(s.createdAt) < staleThreshold);

      let markedStale = 0;
      for (const submission of staleSubmissions) {
        try {
          // Cancel stale submissions with appropriate reason
          const context = {
            tenantId: submission.tenantId,
            organizationId: submission.organizationId,
            clinicId: submission.clinicId,
            userId: 'system',
          };

          await this.eFacturaService.cancelSubmission(
            submission._id.toString(),
            `Marked as stale - pending for over ${staleThresholdHours} hours`,
            context,
          );

          markedStale++;
          stats.totalProcessed++;

          this.logger.log(
            `Marked submission ${submission._id} as stale (invoice: ${submission.invoiceNumber})`,
          );
        } catch (error) {
          this.logger.warn(
            `Failed to mark submission ${submission._id} as stale: ${error instanceof Error ? error.message : String(error)}`,
          );
          stats.totalErrors++;
        }
      }

      stats.lastRunSuccess = true;
      stats.lastRunProcessedCount = markedStale;

      if (markedStale > 0) {
        this.logger.log(`Stale cleanup completed: ${markedStale} submissions marked as stale`);
      }

      // Emit completion event
      this.eventEmitter.emit('efactura.scheduler.stale-cleanup.completed', {
        markedStale,
        durationMs: Date.now() - startTime,
      });
    } catch (error) {
      stats.lastRunSuccess = false;
      stats.lastRunErrors = [error instanceof Error ? error.message : String(error)];
      this.logger.error('Stale cleanup failed', error);
    } finally {
      stats.lastRunDurationMs = Date.now() - startTime;
      this.jobLocks['staleCleanup'] = false;
    }
  }

  // ============================================
  // Management Methods
  // ============================================

  /**
   * Enable or disable the scheduler
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.logger.log(`E-Factura scheduler ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get scheduler status and statistics
   */
  getStatus(): {
    enabled: boolean;
    jobs: Record<string, JobExecutionStats>;
    nextRuns: Record<string, Date | null>;
  } {
    const nextRuns: Record<string, Date | null> = {};

    // Get next run times from scheduler registry
    try {
      const jobNames = [
        'efactura-pending-processor',
        'efactura-status-checker',
        'efactura-retry-processor',
        'efactura-deadline-monitor',
        'efactura-stale-cleanup',
      ];

      for (const jobName of jobNames) {
        try {
          const job = this.schedulerRegistry.getCronJob(jobName);
          nextRuns[jobName] = job.nextDate().toJSDate();
        } catch {
          nextRuns[jobName] = null;
        }
      }
    } catch {
      // Registry not available
    }

    return {
      enabled: this.isEnabled,
      jobs: this.jobStats,
      nextRuns,
    };
  }

  /**
   * Manually trigger a specific job
   */
  async triggerJob(
    jobName: 'pending' | 'status' | 'retry' | 'deadline' | 'cleanup',
  ): Promise<void> {
    this.logger.log(`Manually triggering job: ${jobName}`);

    switch (jobName) {
      case 'pending':
        await this.processPendingSubmissions();
        break;
      case 'status':
        await this.checkSubmissionStatuses();
        break;
      case 'retry':
        await this.processRetries();
        break;
      case 'deadline':
        await this.monitorDeadlines();
        break;
      case 'cleanup':
        await this.cleanupStaleSubmissions();
        break;
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
