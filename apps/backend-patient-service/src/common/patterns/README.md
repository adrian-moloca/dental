# Design Patterns in Enterprise Service

This directory contains implementations of common design patterns used throughout the Enterprise Service.

## Pattern Categories

### Creational Patterns

#### Factory Pattern
**Purpose:** Create objects without specifying the exact class to create.

**Use Cases:**
- Creating different types of reports
- Creating notification handlers
- Creating payment processors

**Example:**
```typescript
interface INotificationService {
  send(message: string): Promise<void>;
}

class EmailNotificationService implements INotificationService {
  async send(message: string): Promise<void> {
    // Send email
  }
}

class SMSNotificationService implements INotificationService {
  async send(message: string): Promise<void> {
    // Send SMS
  }
}

class NotificationServiceFactory {
  static create(type: 'email' | 'sms'): INotificationService {
    switch (type) {
      case 'email':
        return new EmailNotificationService();
      case 'sms':
        return new SMSNotificationService();
      default:
        throw new Error(`Unknown notification type: ${type}`);
    }
  }
}
```

#### Builder Pattern
**Purpose:** Construct complex objects step by step.

**Use Cases:**
- Building complex queries
- Building reports with multiple options
- Building complex DTOs

**Example:**
```typescript
class QueryBuilder<T> {
  private filter: Record<string, unknown> = {};
  private sortOptions: Record<string, 1 | -1> = {};
  private limitValue?: number;
  private skipValue?: number;

  where(field: string, value: unknown): this {
    this.filter[field] = value;
    return this;
  }

  sort(field: string, order: 'asc' | 'desc'): this {
    this.sortOptions[field] = order === 'asc' ? 1 : -1;
    return this;
  }

  limit(value: number): this {
    this.limitValue = value;
    return this;
  }

  skip(value: number): this {
    this.skipValue = value;
    return this;
  }

  build(): QueryOptions<T> {
    return {
      filter: this.filter,
      sort: this.sortOptions,
      limit: this.limitValue,
      skip: this.skipValue,
    };
  }
}

// Usage
const query = new QueryBuilder<Organization>()
  .where('status', OrganizationStatus.ACTIVE)
  .where('subscriptionTier', 'PREMIUM')
  .sort('createdAt', 'desc')
  .limit(20)
  .skip(0)
  .build();
```

### Structural Patterns

#### Repository Pattern
**Purpose:** Separate business logic from data access logic.

**Use Cases:**
- Database operations
- External API calls
- Cache access

**Example:**
```typescript
// See BaseRepository class in common/base/base.repository.ts
```

#### Decorator Pattern
**Purpose:** Add behavior to objects dynamically.

**Use Cases:**
- Adding caching to services
- Adding logging to methods
- Adding validation to DTOs

**Example:**
```typescript
function Cacheable(ttlSeconds: number) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const cache = new Map<string, { data: unknown; expiry: number }>();

    descriptor.value = async function (...args: unknown[]) {
      const cacheKey = JSON.stringify(args);
      const cached = cache.get(cacheKey);

      if (cached && cached.expiry > Date.now()) {
        return cached.data;
      }

      const result = await originalMethod.apply(this, args);

      cache.set(cacheKey, {
        data: result,
        expiry: Date.now() + ttlSeconds * 1000,
      });

      return result;
    };

    return descriptor;
  };
}

// Usage
class OrganizationService {
  @Cacheable(300) // Cache for 5 minutes
  async findById(id: string) {
    // Expensive operation
  }
}
```

### Behavioral Patterns

#### Strategy Pattern
**Purpose:** Define a family of algorithms and make them interchangeable.

**Use Cases:**
- Different payment processing strategies
- Different export formats (CSV, PDF, Excel)
- Different notification channels

**Example:**
```typescript
interface IExportStrategy {
  export(data: unknown[]): Promise<Buffer>;
}

class CSVExportStrategy implements IExportStrategy {
  async export(data: unknown[]): Promise<Buffer> {
    // Convert to CSV
    return Buffer.from('csv data');
  }
}

class PDFExportStrategy implements IExportStrategy {
  async export(data: unknown[]): Promise<Buffer> {
    // Convert to PDF
    return Buffer.from('pdf data');
  }
}

class ExportService {
  async export(data: unknown[], strategy: IExportStrategy): Promise<Buffer> {
    return strategy.export(data);
  }
}

// Usage
const exportService = new ExportService();
const csvBuffer = await exportService.export(data, new CSVExportStrategy());
const pdfBuffer = await exportService.export(data, new PDFExportStrategy());
```

#### Observer Pattern (Event-Driven)
**Purpose:** Notify multiple objects when an event occurs.

**Use Cases:**
- Domain events
- Audit logging
- Analytics tracking

**Example:**
```typescript
// Using NestJS EventEmitter
@Injectable()
class OrganizationService {
  constructor(private eventEmitter: EventEmitter2) {}

  async create(dto: CreateOrganizationDto): Promise<Organization> {
    const organization = await this.save(dto);

    // Emit event
    this.eventEmitter.emit('organization.created', {
      organizationId: organization.id,
      name: organization.name,
      createdAt: organization.createdAt,
    });

    return organization;
  }
}

// Listeners
@Injectable()
class AnalyticsListener {
  @OnEvent('organization.created')
  async handleOrganizationCreated(event: OrganizationCreatedEvent) {
    // Track in analytics
  }
}

@Injectable()
class AuditListener {
  @OnEvent('organization.created')
  async handleOrganizationCreated(event: OrganizationCreatedEvent) {
    // Log to audit trail
  }
}
```

#### Chain of Responsibility
**Purpose:** Pass requests along a chain of handlers.

**Use Cases:**
- Middleware pipeline
- Validation pipeline
- Business rule evaluation

**Example:**
```typescript
interface IValidationHandler<T> {
  setNext(handler: IValidationHandler<T>): IValidationHandler<T>;
  handle(entity: T): Promise<ValidationResult>;
}

abstract class BaseValidationHandler<T> implements IValidationHandler<T> {
  private nextHandler?: IValidationHandler<T>;

  setNext(handler: IValidationHandler<T>): IValidationHandler<T> {
    this.nextHandler = handler;
    return handler;
  }

  async handle(entity: T): Promise<ValidationResult> {
    const result = await this.validate(entity);

    if (!result.isValid) {
      return result;
    }

    if (this.nextHandler) {
      return this.nextHandler.handle(entity);
    }

    return { isValid: true, errors: [] };
  }

  protected abstract validate(entity: T): Promise<ValidationResult>;
}

class RequiredFieldsValidator extends BaseValidationHandler<Organization> {
  protected async validate(entity: Organization): Promise<ValidationResult> {
    const errors: string[] = [];

    if (!entity.name) errors.push('Name is required');
    if (!entity.legalName) errors.push('Legal name is required');

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

class UniqueConstraintValidator extends BaseValidationHandler<Organization> {
  constructor(private repository: OrganizationRepository) {
    super();
  }

  protected async validate(entity: Organization): Promise<ValidationResult> {
    const existing = await this.repository.findOne({ taxId: entity.taxId });

    if (existing) {
      return {
        isValid: false,
        errors: ['Organization with this tax ID already exists'],
      };
    }

    return { isValid: true, errors: [] };
  }
}

// Usage
const validator = new RequiredFieldsValidator();
validator
  .setNext(new UniqueConstraintValidator(repository));

const result = await validator.handle(organization);
```

#### Specification Pattern
**Purpose:** Define business rules that can be combined.

**Use Cases:**
- Complex business rule validation
- Query building
- Filtering

**Example:**
```typescript
// See BusinessRuleBase in common/rules/business-rule.base.ts
```

## Anti-Patterns to Avoid

### God Object
**Problem:** Single class that knows/does too much.

**Solution:** Follow Single Responsibility Principle (SRP).

### Spaghetti Code
**Problem:** Code with complex and tangled control structure.

**Solution:** Use clear abstractions, follow SOLID principles.

### Golden Hammer
**Problem:** Using the same solution for every problem.

**Solution:** Understand different patterns and choose appropriately.

### Premature Optimization
**Problem:** Optimizing before understanding the problem.

**Solution:** Make it work, make it right, make it fast (in that order).

## Best Practices

1. **Keep It Simple:** Don't over-engineer. Use patterns only when they solve real problems.

2. **Follow SOLID:**
   - Single Responsibility Principle
   - Open/Closed Principle
   - Liskov Substitution Principle
   - Interface Segregation Principle
   - Dependency Inversion Principle

3. **Test Your Patterns:** Patterns should make code more testable, not less.

4. **Document Decisions:** Explain why you chose a particular pattern.

5. **Be Consistent:** Use the same patterns across the codebase for similar problems.
