# MongoDB Transaction Examples

## Table of Contents
1. [Basic Transaction Usage](#basic-transaction-usage)
2. [Create Organization with Clinic](#create-organization-with-clinic)
3. [Transfer Provider Between Clinics](#transfer-provider-between-clinics)
4. [Update with Optimistic Locking](#update-with-optimistic-locking)
5. [Cascading Soft Delete](#cascading-soft-delete)
6. [Error Handling and Rollback](#error-handling-and-rollback)

---

## Basic Transaction Usage

### Using TransactionManager

```typescript
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { TransactionManager } from '@dentalos/shared-infra';
import { OrganizationRepository } from '../repositories/organization.repository';

@Injectable()
export class OrganizationService {
  private transactionManager: TransactionManager;

  constructor(
    @InjectConnection() private connection: Connection,
    private organizationRepo: OrganizationRepository,
  ) {
    this.transactionManager = new TransactionManager(connection);
  }

  async createOrganization(dto: CreateOrganizationDto, context: Context) {
    return this.transactionManager.execute(async (session) => {
      return this.organizationRepo.create(
        dto,
        context,
        { session },
      );
    });
  }
}
```

### Using BaseRepository.withTransaction

```typescript
async createOrganization(dto: CreateOrganizationDto, context: Context) {
  return this.organizationRepo.withTransaction(async (session) => {
    return this.organizationRepo.create(
      dto,
      context,
      { session },
    );
  });
}
```

---

## Create Organization with Clinic

### Atomic Multi-Document Creation

```typescript
@Injectable()
export class OrganizationService {
  constructor(
    @InjectConnection() private connection: Connection,
    private organizationRepo: OrganizationRepository,
    private clinicRepo: ClinicRepository,
    private eventEmitter: EventEmitter2,
  ) {
    this.transactionManager = new TransactionManager(connection);
  }

  async createOrganizationWithClinic(
    orgDto: CreateOrganizationDto,
    clinicDto: CreateClinicDto,
    context: { userId: string; tenantId: string },
  ): Promise<{
    organization: OrganizationDocument;
    clinic: ClinicDocument;
  }> {
    return this.transactionManager.execute(async (session) => {
      // Step 1: Create organization
      const organization = await this.organizationRepo.create(
        {
          ...orgDto,
          currentClinicCount: 1, // Will have one clinic
        },
        context,
        { session },
      );

      // Step 2: Create clinic linked to organization
      const clinic = await this.clinicRepo.create(
        {
          ...clinicDto,
          organizationId: organization._id.toString(),
        },
        {
          ...context,
          tenantId: organization._id.toString(), // Org is the tenant
        },
        { session },
      );

      // Step 3: Emit events (these will fire after transaction commits)
      this.eventEmitter.emit('enterprise.organization.created', {
        organizationId: organization._id.toString(),
        name: organization.name,
        createdBy: context.userId,
        timestamp: new Date().toISOString(),
      });

      this.eventEmitter.emit('enterprise.clinic.created', {
        clinicId: clinic._id.toString(),
        organizationId: organization._id.toString(),
        name: clinic.name,
        createdBy: context.userId,
        timestamp: new Date().toISOString(),
      });

      return { organization, clinic };
    });
  }
}
```

### With Automatic Retry on Conflicts

```typescript
async createOrganizationWithClinicRetry(
  orgDto: CreateOrganizationDto,
  clinicDto: CreateClinicDto,
  context: { userId: string; tenantId: string },
): Promise<{ organization: OrganizationDocument; clinic: ClinicDocument }> {
  return this.transactionManager.executeWithRetry(
    async (session) => {
      const organization = await this.organizationRepo.create(
        orgDto,
        context,
        { session },
      );

      const clinic = await this.clinicRepo.create(
        {
          ...clinicDto,
          organizationId: organization._id.toString(),
        },
        {
          ...context,
          tenantId: organization._id.toString(),
        },
        { session },
      );

      return { organization, clinic };
    },
    {}, // options
    3,  // max retries
  );
}
```

---

## Transfer Provider Between Clinics

### Atomic Reassignment

```typescript
@Injectable()
export class ProviderAssignmentService {
  constructor(
    @InjectConnection() private connection: Connection,
    private assignmentRepo: ProviderClinicAssignmentRepository,
  ) {
    this.transactionManager = new TransactionManager(connection);
  }

  async transferProvider(
    providerId: string,
    fromClinicId: string,
    toClinicId: string,
    context: { userId: string; tenantId: string },
  ): Promise<{
    oldAssignment: ProviderClinicAssignmentDocument;
    newAssignment: ProviderClinicAssignmentDocument;
  }> {
    return this.transactionManager.execute(async (session) => {
      // Step 1: Deactivate old assignment
      const oldAssignment = await this.assignmentRepo.updateOne(
        { providerId, clinicId: fromClinicId, isActive: true },
        {
          isActive: false,
          unassignedAt: new Date(),
          unassignedBy: context.userId,
        },
        context,
        { session },
      );

      if (!oldAssignment) {
        throw new NotFoundException(
          `Active assignment not found for provider ${providerId} at clinic ${fromClinicId}`,
        );
      }

      // Step 2: Check if assignment to new clinic already exists
      const existingAssignment = await this.assignmentRepo.findOne(
        { providerId, clinicId: toClinicId },
        context.tenantId,
        { session, showDeleted: true },
      );

      let newAssignment: ProviderClinicAssignmentDocument;

      if (existingAssignment) {
        // Step 3a: Reactivate existing assignment
        newAssignment = await this.assignmentRepo.updateById(
          existingAssignment._id.toString(),
          {
            isActive: true,
            assignedAt: new Date(),
            assignedBy: context.userId,
            unassignedAt: null,
            unassignedBy: null,
          },
          context,
          { session },
        );
      } else {
        // Step 3b: Create new assignment
        newAssignment = await this.assignmentRepo.create(
          {
            providerId,
            clinicId: toClinicId,
            isActive: true,
            assignedAt: new Date(),
            assignedBy: context.userId,
          },
          context,
          { session },
        );
      }

      return { oldAssignment, newAssignment };
    });
  }
}
```

---

## Update with Optimistic Locking

### Preventing Lost Updates

```typescript
async updateOrganizationWithOptimisticLock(
  organizationId: string,
  update: UpdateOrganizationDto,
  expectedVersion: number,
  context: { userId: string; tenantId: string },
): Promise<OrganizationDocument> {
  return this.transactionManager.execute(async (session) => {
    // Find with current version
    const organization = await this.organizationRepo.findById(
      organizationId,
      context.tenantId,
      { session },
    );

    if (!organization) {
      throw new NotFoundException(`Organization ${organizationId} not found`);
    }

    // Check version
    if (organization.version !== expectedVersion) {
      throw new ConflictException(
        `Organization was modified by another user. Expected version ${expectedVersion}, got ${organization.version}`,
      );
    }

    // Apply updates
    Object.assign(organization, update);
    organization.updatedBy = context.userId;
    organization.version += 1;

    await organization.save({ session });

    return organization;
  });
}
```

### With Automatic Retry on Version Conflict

```typescript
async updateWithRetryOnConflict(
  organizationId: string,
  updateFn: (org: OrganizationDocument) => void,
  context: { userId: string; tenantId: string },
  maxRetries = 3,
): Promise<OrganizationDocument> {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      return await this.transactionManager.execute(async (session) => {
        const organization = await this.organizationRepo.findById(
          organizationId,
          context.tenantId,
          { session },
        );

        if (!organization) {
          throw new NotFoundException(`Organization ${organizationId} not found`);
        }

        const expectedVersion = organization.version;

        // Apply custom update function
        updateFn(organization);

        organization.updatedBy = context.userId;
        organization.version = expectedVersion + 1;

        await organization.save({ session });

        return organization;
      });
    } catch (error) {
      if (error instanceof ConflictException && attempt < maxRetries - 1) {
        attempt++;
        this.logger.warn(
          `Optimistic lock conflict, retrying (attempt ${attempt}/${maxRetries})`,
        );
        await this.delay(100 * Math.pow(2, attempt));
        continue;
      }
      throw error;
    }
  }

  throw new ConflictException('Failed to update after maximum retries');
}

private delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

---

## Cascading Soft Delete

### Delete Organization and All Related Data

```typescript
async deleteOrganizationWithCascade(
  organizationId: string,
  context: { userId: string; tenantId: string },
): Promise<void> {
  await this.transactionManager.execute(async (session) => {
    // Step 1: Soft delete organization
    const organization = await this.organizationRepo.softDeleteById(
      organizationId,
      context,
      { session },
    );

    if (!organization) {
      throw new NotFoundException(`Organization ${organizationId} not found`);
    }

    // Step 2: Soft delete all clinics
    const clinicCount = await this.clinicRepo.updateMany(
      { organizationId },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: context.userId,
      },
      context,
      { session },
    );

    this.logger.log(`Soft deleted ${clinicCount} clinics`);

    // Step 3: Soft delete all assignments
    const assignmentCount = await this.assignmentRepo.updateMany(
      { organizationId },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: context.userId,
      },
      context,
      { session },
    );

    this.logger.log(`Soft deleted ${assignmentCount} assignments`);

    // Step 4: Emit cascade delete event
    this.eventEmitter.emit('enterprise.organization.cascade_deleted', {
      organizationId,
      clinicsDeleted: clinicCount,
      assignmentsDeleted: assignmentCount,
      deletedBy: context.userId,
      timestamp: new Date().toISOString(),
    });
  });
}
```

### Restore Organization and Related Data

```typescript
async restoreOrganizationWithCascade(
  organizationId: string,
  context: { userId: string; tenantId: string },
): Promise<void> {
  await this.transactionManager.execute(async (session) => {
    // Step 1: Restore organization
    const organization = await this.organizationRepo.updateById(
      organizationId,
      {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      },
      context,
      { session, showDeleted: true },
    );

    if (!organization) {
      throw new NotFoundException(`Organization ${organizationId} not found`);
    }

    // Step 2: Restore all clinics
    const clinicCount = await this.clinicRepo.updateMany(
      { organizationId },
      {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      },
      context,
      { session },
    );

    // Step 3: Restore all assignments
    const assignmentCount = await this.assignmentRepo.updateMany(
      { organizationId },
      {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      },
      context,
      { session },
    );

    this.logger.log(
      `Restored organization ${organizationId} with ${clinicCount} clinics and ${assignmentCount} assignments`,
    );
  });
}
```

---

## Error Handling and Rollback

### Manual Transaction Control

```typescript
async complexOperationWithManualControl(
  data: ComplexOperationDto,
  context: { userId: string; tenantId: string },
): Promise<ComplexOperationResult> {
  const session = await this.connection.startSession();
  session.startTransaction();

  try {
    // Step 1: Validate preconditions
    const organization = await this.organizationRepo.findById(
      data.organizationId,
      context.tenantId,
      { session },
    );

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (!organization.canAddClinic()) {
      throw new BadRequestException('Organization has reached clinic limit');
    }

    // Step 2: Create clinic
    const clinic = await this.clinicRepo.create(
      data.clinicData,
      {
        ...context,
        tenantId: organization._id.toString(),
      },
      { session },
    );

    // Step 3: Increment organization clinic count
    await this.organizationRepo.incrementClinicCount(
      data.organizationId,
      context,
      { session },
    );

    // Step 4: Create initial assignments
    const assignments = await Promise.all(
      data.providerIds.map((providerId) =>
        this.assignmentRepo.create(
          {
            providerId,
            clinicId: clinic._id.toString(),
            organizationId: data.organizationId,
            isActive: true,
            assignedAt: new Date(),
            assignedBy: context.userId,
          },
          context,
          { session },
        ),
      ),
    );

    // Commit transaction
    await session.commitTransaction();
    this.logger.log('Complex operation completed successfully');

    return {
      organization,
      clinic,
      assignments,
    };
  } catch (error) {
    // Rollback on any error
    this.logger.error('Complex operation failed, rolling back', error);

    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    // Re-throw the error
    throw error;
  } finally {
    // Always end the session
    await session.endSession();
  }
}
```

### Partial Rollback with Savepoints (MongoDB doesn't support savepoints, use nested transactions)

```typescript
async operationWithPartialRollback(
  data: OperationDto,
  context: { userId: string; tenantId: string },
): Promise<OperationResult> {
  return this.transactionManager.execute(async (session) => {
    // Main transaction

    // Critical operation - must succeed
    const organization = await this.organizationRepo.create(
      data.organizationData,
      context,
      { session },
    );

    // Optional operation - can fail without rolling back main transaction
    let clinic: ClinicDocument | null = null;

    try {
      clinic = await this.clinicRepo.create(
        data.clinicData,
        {
          ...context,
          tenantId: organization._id.toString(),
        },
        { session },
      );
    } catch (error) {
      // Log but don't fail the transaction
      this.logger.warn('Clinic creation failed, continuing without clinic', error);
    }

    return {
      organization,
      clinic,
    };
  });
}
```

### Transaction with Timeout

```typescript
async operationWithTimeout(
  data: OperationDto,
  context: { userId: string; tenantId: string },
  timeoutMs = 5000,
): Promise<OperationResult> {
  return Promise.race([
    this.transactionManager.execute(async (session) => {
      // Your transaction logic here
      return await this.performOperation(data, context, session);
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Transaction timeout')), timeoutMs),
    ),
  ]);
}
```

---

## Best Practices

### 1. Keep Transactions Short

```typescript
// ❌ BAD: Long-running operation in transaction
async badTransactionExample() {
  return this.transactionManager.execute(async (session) => {
    const data = await this.fetchFromExternalAPI(); // SLOW
    await this.processLargeDataset(data); // SLOW
    return this.saveResults(data, session);
  });
}

// ✅ GOOD: Only database operations in transaction
async goodTransactionExample() {
  // Do slow operations OUTSIDE transaction
  const data = await this.fetchFromExternalAPI();
  const processed = await this.processLargeDataset(data);

  // Only save in transaction
  return this.transactionManager.execute(async (session) => {
    return this.saveResults(processed, session);
  });
}
```

### 2. Always Use Sessions

```typescript
// ❌ BAD: Missing session parameter
await this.organizationRepo.create(data, context); // Not in transaction!

// ✅ GOOD: Pass session to all operations
await this.organizationRepo.create(data, context, { session });
```

### 3. Handle Errors Properly

```typescript
// ✅ GOOD: Proper error handling
try {
  await this.transactionManager.execute(async (session) => {
    // Transaction logic
  });
} catch (error) {
  if (error instanceof ConflictException) {
    // Handle conflict specifically
  } else if (error instanceof NotFoundException) {
    // Handle not found
  } else {
    // Handle other errors
    this.logger.error('Transaction failed', error);
    throw error;
  }
}
```

### 4. Use Retry for Transient Errors

```typescript
// ✅ GOOD: Automatic retry on transient errors
await this.transactionManager.executeWithRetry(
  async (session) => {
    // Transaction logic that might fail due to conflicts
  },
  {},
  3, // max retries
);
```

---

**Last Updated**: 2025-11-24
**Maintained By**: Backend Enterprise Service Team
