/**
 * Alerting Service
 *
 * Handles health check alerting and notifications.
 * Sends alerts when services transition from healthy to unhealthy state.
 *
 * Features:
 * - Webhook notifications (Slack, Discord, PagerDuty, custom)
 * - Alert deduplication (prevents alert spam)
 * - Configurable alert thresholds
 * - Recovery notifications
 * - Alert history tracking
 *
 * @module health/alerting
 */

import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ServiceDefinition } from '../config/services.config';

export interface AlertPayload {
  serviceName: string;
  displayName: string;
  status: 'down' | 'degraded' | 'recovered';
  timestamp: string;
  error?: string;
  responseTime?: number;
  consecutiveFailures?: number;
  uptimePercentage?: number;
  critical: boolean;
}

export interface AlertHistory {
  serviceName: string;
  status: 'down' | 'degraded' | 'recovered';
  timestamp: Date;
  notified: boolean;
  error?: string;
}

@Injectable()
export class AlertingService {
  private readonly logger = new Logger(AlertingService.name);

  /**
   * Track last known status for each service
   * Used to detect state transitions (healthy -> unhealthy)
   */
  private readonly lastKnownStatus = new Map<string, 'up' | 'down' | 'degraded'>();

  /**
   * Alert history (last 100 alerts)
   */
  private readonly alertHistory: AlertHistory[] = [];
  private readonly MAX_ALERT_HISTORY = 100;

  /**
   * Webhook URLs for notifications
   */
  private readonly webhookUrls: string[] = [];

  /**
   * Alert cooldown period (prevents alert spam)
   * Don't send duplicate alerts within this period
   */
  private readonly ALERT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Last alert time for each service
   */
  private readonly lastAlertTime = new Map<string, number>();

  constructor() {
    // Load webhook URLs from environment
    const webhookUrl = process.env.HEALTH_ALERT_WEBHOOK_URL;
    if (webhookUrl) {
      this.webhookUrls.push(webhookUrl);
      this.logger.log(`Alerting configured with webhook: ${webhookUrl}`);
    }

    // Support multiple webhooks (comma-separated)
    const additionalWebhooks = process.env.HEALTH_ALERT_WEBHOOKS;
    if (additionalWebhooks) {
      const urls = additionalWebhooks.split(',').map((url) => url.trim());
      this.webhookUrls.push(...urls);
      this.logger.log(`Additional webhooks configured: ${urls.length}`);
    }

    if (this.webhookUrls.length === 0) {
      this.logger.warn(
        'No webhook URLs configured. Set HEALTH_ALERT_WEBHOOK_URL environment variable.',
      );
    }
  }

  /**
   * Process health check and send alert if needed
   *
   * Detects state transitions and sends appropriate notifications.
   *
   * @param service - Service definition
   * @param status - Current health status
   * @param error - Error message (if unhealthy)
   * @param responseTime - Response time in milliseconds
   * @param consecutiveFailures - Number of consecutive failures
   * @param uptimePercentage - Current uptime percentage
   */
  async processHealthCheck(
    service: ServiceDefinition,
    status: 'up' | 'down' | 'degraded',
    error?: string,
    responseTime?: number,
    consecutiveFailures?: number,
    uptimePercentage?: number,
  ): Promise<void> {
    const lastStatus = this.lastKnownStatus.get(service.name);
    const statusChanged = lastStatus !== undefined && lastStatus !== status;

    // Update last known status
    this.lastKnownStatus.set(service.name, status);

    // Determine if we should alert
    let shouldAlert = false;
    let alertType: 'down' | 'degraded' | 'recovered' | null = null;

    if (statusChanged) {
      if (status === 'down' && lastStatus !== 'down') {
        shouldAlert = true;
        alertType = 'down';
      } else if (status === 'degraded' && lastStatus === 'up') {
        shouldAlert = true;
        alertType = 'degraded';
      } else if (status === 'up' && (lastStatus === 'down' || lastStatus === 'degraded')) {
        shouldAlert = true;
        alertType = 'recovered';
      }
    }

    // Check alert cooldown
    if (shouldAlert && alertType !== 'recovered') {
      const lastAlertTimestamp = this.lastAlertTime.get(service.name) || 0;
      const timeSinceLastAlert = Date.now() - lastAlertTimestamp;

      if (timeSinceLastAlert < this.ALERT_COOLDOWN_MS) {
        this.logger.debug(
          `Alert cooldown active for ${service.name} (${Math.round(timeSinceLastAlert / 1000)}s since last alert)`,
        );
        shouldAlert = false;
      }
    }

    // Send alert if needed
    if (shouldAlert && alertType) {
      await this.sendAlert({
        serviceName: service.name,
        displayName: service.displayName,
        status: alertType,
        timestamp: new Date().toISOString(),
        error,
        responseTime,
        consecutiveFailures,
        uptimePercentage,
        critical: service.critical,
      });

      // Update last alert time
      this.lastAlertTime.set(service.name, Date.now());

      // Record in history
      this.recordAlert({
        serviceName: service.name,
        status: alertType,
        timestamp: new Date(),
        notified: true,
        error,
      });
    }
  }

  /**
   * Send alert to configured webhooks
   *
   * @param payload - Alert payload
   */
  private async sendAlert(payload: AlertPayload): Promise<void> {
    if (this.webhookUrls.length === 0) {
      this.logger.warn(
        `Alert triggered for ${payload.serviceName} (${payload.status}) but no webhooks configured`,
      );
      return;
    }

    const emoji = this.getStatusEmoji(payload.status);
    const color = this.getStatusColor(payload.status);

    // Log alert
    this.logger.warn(
      `${emoji} Alert: ${payload.displayName} is ${payload.status.toUpperCase()} ${
        payload.error ? `- ${payload.error}` : ''
      }`,
    );

    // Prepare webhook payloads for different platforms
    const slackPayload = this.formatSlackPayload(payload, emoji, color);
    const discordPayload = this.formatDiscordPayload(payload, emoji, color);
    const genericPayload = payload; // Generic JSON payload

    // Send to all webhooks
    const promises = this.webhookUrls.map(async (url) => {
      try {
        // Detect webhook type and format accordingly
        let requestPayload: any;
        if (url.includes('slack.com')) {
          requestPayload = slackPayload;
        } else if (url.includes('discord.com')) {
          requestPayload = discordPayload;
        } else {
          requestPayload = genericPayload;
        }

        const response = await axios.post(url, requestPayload, {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        this.logger.log(
          `Alert sent successfully to webhook: ${url.substring(0, 50)}... (status: ${response.status})`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send alert to webhook ${url.substring(0, 50)}...: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Format alert for Slack webhook
   */
  private formatSlackPayload(payload: AlertPayload, emoji: string, color: string): any {
    const fields: any[] = [
      {
        title: 'Status',
        value: `${emoji} ${payload.status.toUpperCase()}`,
        short: true,
      },
      {
        title: 'Critical',
        value: payload.critical ? 'Yes' : 'No',
        short: true,
      },
    ];

    if (payload.responseTime) {
      fields.push({
        title: 'Response Time',
        value: `${payload.responseTime}ms`,
        short: true,
      });
    }

    if (payload.consecutiveFailures) {
      fields.push({
        title: 'Consecutive Failures',
        value: payload.consecutiveFailures.toString(),
        short: true,
      });
    }

    if (payload.uptimePercentage !== undefined) {
      fields.push({
        title: 'Uptime',
        value: `${payload.uptimePercentage.toFixed(1)}%`,
        short: true,
      });
    }

    if (payload.error) {
      fields.push({
        title: 'Error',
        value: `\`\`\`${payload.error}\`\`\``,
        short: false,
      });
    }

    return {
      attachments: [
        {
          color,
          fallback: `${payload.displayName} is ${payload.status}`,
          title: `DentalOS Service Alert: ${payload.displayName}`,
          text: payload.critical
            ? 'Critical service requires immediate attention'
            : 'Service health check failed',
          fields,
          footer: 'DentalOS Health Aggregator',
          ts: Math.floor(new Date(payload.timestamp).getTime() / 1000),
        },
      ],
    };
  }

  /**
   * Format alert for Discord webhook
   */
  private formatDiscordPayload(payload: AlertPayload, emoji: string, color: string): any {
    const fields: any[] = [
      { name: 'Service', value: payload.displayName, inline: true },
      { name: 'Status', value: `${emoji} ${payload.status.toUpperCase()}`, inline: true },
      { name: 'Critical', value: payload.critical ? 'Yes' : 'No', inline: true },
    ];

    if (payload.responseTime) {
      fields.push({
        name: 'Response Time',
        value: `${payload.responseTime}ms`,
        inline: true,
      });
    }

    if (payload.consecutiveFailures) {
      fields.push({
        name: 'Consecutive Failures',
        value: payload.consecutiveFailures.toString(),
        inline: true,
      });
    }

    if (payload.error) {
      fields.push({ name: 'Error', value: `\`${payload.error}\``, inline: false });
    }

    return {
      embeds: [
        {
          title: 'DentalOS Service Alert',
          description: `${payload.displayName} health status changed`,
          color: parseInt(color.replace('#', ''), 16),
          fields,
          timestamp: payload.timestamp,
          footer: { text: 'DentalOS Health Aggregator' },
        },
      ],
    };
  }

  /**
   * Get emoji for status
   */
  private getStatusEmoji(status: 'down' | 'degraded' | 'recovered'): string {
    switch (status) {
      case 'down':
        return '🔴';
      case 'degraded':
        return '🟡';
      case 'recovered':
        return '🟢';
    }
  }

  /**
   * Get color code for status
   */
  private getStatusColor(status: 'down' | 'degraded' | 'recovered'): string {
    switch (status) {
      case 'down':
        return '#DC3545'; // Red
      case 'degraded':
        return '#FFC107'; // Yellow
      case 'recovered':
        return '#28A745'; // Green
    }
  }

  /**
   * Record alert in history
   */
  private recordAlert(alert: AlertHistory): void {
    this.alertHistory.push(alert);

    // Maintain max history size
    if (this.alertHistory.length > this.MAX_ALERT_HISTORY) {
      this.alertHistory.shift();
    }
  }

  /**
   * Get alert history
   *
   * @param limit - Maximum number of records to return
   * @returns Recent alert history
   */
  getAlertHistory(limit = 50): AlertHistory[] {
    return this.alertHistory
      .slice(-limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get alerts for a specific service
   *
   * @param serviceName - Service identifier
   * @param limit - Maximum number of records to return
   * @returns Alert history for service
   */
  getServiceAlerts(serviceName: string, limit = 20): AlertHistory[] {
    return this.alertHistory
      .filter((alert) => alert.serviceName === serviceName)
      .slice(-limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Clear alert history
   */
  clearAlertHistory(): void {
    this.alertHistory.length = 0;
    this.logger.log('Alert history cleared');
  }

  /**
   * Get alerting statistics
   */
  getAlertingStats(): {
    totalAlerts: number;
    alertsByStatus: Record<string, number>;
    servicesWithAlerts: number;
    webhooksConfigured: number;
  } {
    const alertsByStatus: Record<string, number> = {
      down: 0,
      degraded: 0,
      recovered: 0,
    };

    const servicesSet = new Set<string>();

    for (const alert of this.alertHistory) {
      alertsByStatus[alert.status]++;
      servicesSet.add(alert.serviceName);
    }

    return {
      totalAlerts: this.alertHistory.length,
      alertsByStatus,
      servicesWithAlerts: servicesSet.size,
      webhooksConfigured: this.webhookUrls.length,
    };
  }
}
