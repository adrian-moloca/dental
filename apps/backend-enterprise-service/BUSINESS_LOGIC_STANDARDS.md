# Business Logic and Utilities Standards

## Table of Contents

1. [Logic Organization](#logic-organization)
2. [Utility Standards](#utility-standards)
3. [Middleware Standards](#middleware-standards)
4. [Try-Catch Patterns](#try-catch-patterns)
5. [Business Rules](#business-rules)
6. [Code Reusability](#code-reusability)
7. [Testing Standards](#testing-standards)
8. [Examples](#examples)

---

## Logic Organization

### Service Layer Patterns

The service layer contains business logic and orchestrates operations across repositories, external services, and domain events.

#### Structure

```
src/
├── modules/
│   └── organizations/
│       ├── organizations.module.ts      # Module definition
│       ├── organizations.controller.ts  # HTTP layer
│       ├── organizations.service.ts     # Business logic
│       ├── organizations.repository.ts  # Data access (optional)
│       └── dto/                        # Data transfer objects
│           ├── create-organization.dto.ts
│           └── update-organization.dto.ts
```

#### Service Class Example

```typescript
@Injectable()
export class OrganizationsService extends BaseService<OrganizationDocument> {
  constructor(
    @InjectModel(OrganizationDocument.name)
    model: Model<OrganizationDocument>,
    private eventEmitter: EventEmitter2,
    private validator: BusinessRuleValidator<Organization>,
  ) {
    super(model, eventEmitter, OrganizationsService.name);
  }

  async create(dto: CreateOrganizationDto, context: ServiceContext) {
    // 1. Validate business rules
    const validationResult = await this.validator.validate(dto);
    if (!validationResult.isValid) {
      throw new ValidationError(validationResult.failures);
    }

    // 2. Create entity
    const organization = await super.create(dto, context);

    // 3. Emit domain event
    this.emitEvent('enterprise.organization.created', {
      organizationId: organization._id.toString(),
      name: organization.name,
      // ... other fields
    }, context);

    return organization;
  }
}
```

### Repository Pattern vs Direct Model Access

**Use Repository Pattern When:**
- Complex queries needed
- Multiple data sources (database + cache)
- Need to abstract database implementation
- Shared queries across multiple services

**Use Direct Model Access When:**
- Simple CRUD operations
- Single data source
- No complex query logic
- Rapid prototyping

#### Repository Example

```typescript
@Injectable()
export class OrganizationRepository extends BaseRepository<OrganizationDocument> {
  constructor(
    @InjectModel(OrganizationDocument.name) model: Model<OrganizationDocument>,
  ) {
    super(model, 'OrganizationRepository');
  }

  async findActiveBySubscriptionTier(tier: SubscriptionTier): Promise<OrganizationDocument[]> {
    return this.findAll({
      status: OrganizationStatus.ACTIVE,
      subscriptionTier: tier,
    });
  }

  async countByStatus(status: OrganizationStatus): Promise<number> {
    return this.count({ status });
  }
}
```

### Business Logic vs Controller Logic Separation

**Controller Responsibilities:**
- Request validation (DTO validation)
- Extract context from request
- Call service methods
- Format responses
- Error handling (delegated to filters)

**Service Responsibilities:**
- Business rule validation
- Business logic execution
- Transaction management
- Event emission
- Orchestrate repository calls

**Example - What Belongs Where:**

```typescript
// ❌ BAD - Business logic in controller
@Controller('organizations')
export class OrganizationsController {
  @Post()
  async create(@Body() dto: CreateOrganizationDto) {
    // DON'T do this in controller
    const existing = await this.model.findOne({ taxId: dto.taxId });
    if (existing) {
      throw new ConflictException('Organization exists');
    }

    const org = new this.model(dto);
    await org.save();

    // DON'T emit events from controller
    this.eventEmitter.emit('org.created', { id: org.id });

    return org;
  }
}

// ✅ GOOD - Thin controller, fat service
@Controller('organizations')
export class OrganizationsController extends BaseController {
  constructor(private service: OrganizationsService) {
    super('OrganizationsController');
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateOrganizationDto) {
    const context = this.getContext(req);
    return this.service.create(dto, context);
  }
}

@Injectable()
export class OrganizationsService extends BaseService<OrganizationDocument> {
  async create(dto: CreateOrganizationDto, context: ServiceContext) {
    // Business rule: No duplicate tax IDs
    const existing = await this.findOne({ taxId: dto.taxId });
    if (existing) {
      throw new ConflictException('Organization with this tax ID already exists');
    }

    // Create entity
    const organization = await super.create(dto, context);

    // Emit event
    this.emitEvent('enterprise.organization.created', {
      organizationId: organization._id.toString(),
      // ...
    }, context);

    return organization;
  }
}
```

### Shared Utilities Location

```
src/
├── common/
│   ├── utils/              # Shared utility functions
│   │   ├── date.util.ts
│   │   ├── string.util.ts
│   │   ├── validation.util.ts
│   │   ├── transformation.util.ts
│   │   ├── error.util.ts
│   │   └── index.ts
│   ├── middleware/         # Shared middleware
│   ├── base/              # Base classes
│   ├── rules/             # Business rules
│   └── validators/        # Custom validators
```

### Helper Functions Organization

```typescript
// Module-specific helpers
src/modules/organizations/helpers/
  ├── subscription-tier.helper.ts
  └── organization-metrics.helper.ts

// Shared helpers
src/common/utils/
  ├── date.util.ts
  ├── string.util.ts
  └── ...
```

---

## Utility Standards

### Date/Time Utilities

**File:** `src/common/utils/date.util.ts`

**Features:**
- Timezone conversions
- Business hours calculations
- Date formatting
- Age calculations
- Fiscal year calculations
- Working days calculations

**Example:**

```typescript
import { DateUtil } from '@/common/utils';

// Timezone handling
const nowInRomania = DateUtil.now('Europe/Bucharest');
const utcDate = DateUtil.toUTC(someDate);

// Date formatting
const formatted = DateUtil.format(date, 'ro-RO');
const dateOnly = DateUtil.formatDate(date);

// Business hours
const isBusinessHours = DateUtil.isBusinessHours(new Date(), {
  startHour: 9,
  endHour: 17,
  workingDays: [1, 2, 3, 4, 5], // Mon-Fri
  timezone: 'Europe/Bucharest',
});

// Age calculation
const age = DateUtil.calculateAge(birthDate);

// Date arithmetic
const nextWeek = DateUtil.addDays(new Date(), 7);
const nextMonth = DateUtil.addMonths(new Date(), 1);
const nextBusinessDay = DateUtil.addBusinessDays(new Date(), 1);
```

### String Utilities

**File:** `src/common/utils/string.util.ts`

**Features:**
- Romanian diacritics handling
- XSS prevention (HTML escaping)
- Email/phone validation and formatting
- Romanian CUI validation
- String transformations (camelCase, snake_case, kebab-case)
- Masking sensitive data

**Example:**

```typescript
import { StringUtil } from '@/common/utils';

// Sanitization
const safe = StringUtil.escapeHtml(userInput);
const normalized = StringUtil.normalizeWhitespace(text);

// Validation
const isValid = StringUtil.isValidEmail(email);
const isValidPhone = StringUtil.isValidPhone(phone);
const isValidCUI = StringUtil.isValidCUI(cui);

// Formatting
const formattedPhone = StringUtil.formatPhone('0722123456'); // 0722 123 456
const formattedCUI = StringUtil.formatCUI('12345678'); // RO12345678

// Masking
const masked = StringUtil.maskEmail('john@example.com'); // j***@example.com

// Transformations
const slug = StringUtil.slugify('Ștefan Cel Mare'); // stefan-cel-mare
const camel = StringUtil.toCamelCase('first_name'); // firstName
```

### Validation Utilities

**File:** `src/common/utils/validation.util.ts`

**Features:**
- Type validations
- Range validations
- Format validations (email, phone, CUI, UUID, ObjectId)
- Object validation with rules
- Sanitization

**Example:**

```typescript
import { ValidationUtil } from '@/common/utils';

// Type checks
ValidationUtil.isString(value);
ValidationUtil.isNumber(value);
ValidationUtil.isNotEmpty(value);

// Format validation
ValidationUtil.isEmail('test@example.com');
ValidationUtil.isPhone('0722123456');
ValidationUtil.isCUI('RO12345678');
ValidationUtil.isUUID('550e8400-e29b-41d4-a716-446655440000');
ValidationUtil.isObjectId('507f1f77bcf86cd799439011');

// Range validation
ValidationUtil.isInRange(value, 0, 100);
ValidationUtil.isPositive(value);

// Object validation
const result = ValidationUtil.validateObject(organization, [
  ValidationUtil.required('name'),
  ValidationUtil.email('primaryContactEmail'),
  ValidationUtil.phone('primaryContactPhone'),
  ValidationUtil.minLength('name', 3),
  ValidationUtil.maxLength('name', 100),
]);

if (!result.isValid) {
  throw new ValidationException(result.errors);
}
```

### Transformation Utilities

**File:** `src/common/utils/transformation.util.ts`

**Features:**
- DTO transformations
- Pagination helpers
- Deep cloning and merging
- Key/value transformations
- Flattening and unflattening objects

**Example:**

```typescript
import { TransformationUtil } from '@/common/utils';

// Pagination
const paginated = TransformationUtil.paginate(data, total, limit, offset);

// DTO transformation
const dto = TransformationUtil.toDTO(entity, {
  excludeFields: ['password', 'deletedAt'],
  transformDates: true,
  removeNull: true,
});

// Deep operations
const cloned = TransformationUtil.deepClone(object);
const merged = TransformationUtil.deepMerge(target, source);

// Key transformations
const camelCased = TransformationUtil.toCamelCase(snakeCaseObject);
const snakeCased = TransformationUtil.toSnakeCase(camelCaseObject);

// Object manipulation
const picked = TransformationUtil.pick(object, ['id', 'name', 'email']);
const omitted = TransformationUtil.omit(object, ['password', 'secret']);
const flattened = TransformationUtil.flatten(nestedObject);
```

### Error Utilities

**File:** `src/common/utils/error.util.ts`

**Features:**
- Error wrapping with context
- Retry logic with exponential backoff
- Error categorization (operational vs programmer errors)
- Error aggregation
- Async error handling

**Example:**

```typescript
import { ErrorUtil } from '@/common/utils';

// Error wrapping
try {
  await dangerousOperation();
} catch (error) {
  throw ErrorUtil.wrapError(error, {
    operation: 'createOrganization',
    userId: context.userId,
    organizationId: context.organizationId,
  });
}

// Retry with backoff
const result = await ErrorUtil.retry(
  () => externalApiCall(),
  {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
  }
);

// Timeout
const result = await ErrorUtil.withTimeout(
  () => slowOperation(),
  5000, // 5 seconds
  'Operation timed out after 5 seconds'
);

// Safe execution
const { success, data, error } = await ErrorUtil.tryCatch(
  () => riskyOperation()
);

if (success) {
  console.log(data);
} else {
  console.error(error);
}

// Error categorization
if (ErrorUtil.isOperational(error)) {
  // Expected error, log and return user-friendly message
} else {
  // Programmer error, alert team
}

if (ErrorUtil.isRetryable(error)) {
  // Retry the operation
}
```

---

## Middleware Standards

### Request Logging Middleware

**File:** `src/interceptors/logging.interceptor.ts`

**Features:**
- Logs all HTTP requests
- Measures request duration
- Logs slow requests
- PHI-safe logging (no request/response bodies)
- Correlation ID tracking

**Already implemented.** See existing `LoggingInterceptor`.

### Response Time Middleware

**File:** `src/common/middleware/response-time.middleware.ts`

**Features:**
- High-precision timing (process.hrtime)
- X-Response-Time header
- Slow request warnings

**Usage:**

```typescript
// In main.ts or app.module.ts
app.use(new ResponseTimeMiddleware().use.bind(new ResponseTimeMiddleware()));
```

### Compression Middleware

**File:** `src/common/middleware/compression.middleware.ts`

**Features:**
- Compresses text-based responses
- Configurable threshold (1 KB default)
- Smart content-type filtering

**Usage:**

```typescript
import { compressionMiddleware } from '@/common/middleware';

// In main.ts
app.use(compressionMiddleware);
```

### Body Parser Configuration

**In main.ts:**

```typescript
import { getBodyParserLimits } from '@/common/middleware';

const limits = getBodyParserLimits();

app.use(express.json(limits.json));
app.use(express.urlencoded(limits.urlencoded));
```

### Cookie Parser Setup

**In main.ts:**

```typescript
import * as cookieParser from 'cookie-parser';
import { getCookieConfig } from '@/common/middleware';

const cookieConfig = getCookieConfig(
  configService.get('COOKIE_SECRET'),
  configService.get('NODE_ENV') === 'development'
);

app.use(cookieParser(cookieConfig.secret));
```

### CORS Middleware

**File:** `src/common/middleware/security.middleware.ts`

**Features:**
- Multi-origin support
- Wildcard subdomain support
- Credentials support
- Custom headers for multi-tenancy

**Usage:**

```typescript
import { getCorsConfig } from '@/common/middleware';

const corsConfig = getCorsConfig(
  configService.get('CORS_ORIGIN'),
  configService.get('NODE_ENV') === 'development'
);

app.enableCors(corsConfig);
```

---

## Try-Catch Patterns

### Where to Use Try-Catch

**1. External API Calls**

```typescript
async callExternalAPI() {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw ErrorUtil.wrapError(error, {
      operation: 'callExternalAPI',
      metadata: { url },
    });
  }
}
```

**2. Database Operations (when not using base classes)**

```typescript
async findOrganization(id: string) {
  try {
    return await this.model.findById(id).exec();
  } catch (error) {
    throw ErrorUtil.wrapError(error, {
      operation: 'findOrganization',
      metadata: { id },
    });
  }
}
```

**3. File I/O Operations**

```typescript
async readFile(path: string) {
  try {
    return await fs.readFile(path, 'utf-8');
  } catch (error) {
    throw ErrorUtil.wrapError(error, {
      operation: 'readFile',
      metadata: { path },
    });
  }
}
```

### Where NOT to Use Try-Catch

**1. Controller Methods** (handled by global exception filter)

```typescript
// ❌ Don't do this
@Post()
async create(@Body() dto: CreateOrganizationDto) {
  try {
    return await this.service.create(dto);
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}

// ✅ Do this instead
@Post()
async create(@Req() req: Request, @Body() dto: CreateOrganizationDto) {
  const context = this.getContext(req);
  return this.service.create(dto, context);
}
```

**2. When Using Base Classes** (already handle errors)

```typescript
// ❌ Don't do this
async findAll(filter: OrganizationFilterDto) {
  try {
    return await super.findAllPaginated(filter);
  } catch (error) {
    throw error;
  }
}

// ✅ Do this instead
async findAll(filter: OrganizationFilterDto) {
  return super.findAllPaginated(filter);
}
```

### Error Wrapping Strategies

**Strategy 1: Wrap with Context**

```typescript
try {
  await operation();
} catch (error) {
  throw ErrorUtil.wrapError(error, {
    operation: 'operationName',
    userId: context.userId,
    organizationId: context.organizationId,
    metadata: { /* additional context */ },
  });
}
```

**Strategy 2: Transform to Domain Error**

```typescript
try {
  await externalAPI.call();
} catch (error) {
  if (error.response?.status === 404) {
    throw new NotFoundException('Resource not found in external system');
  }
  if (error.response?.status === 429) {
    throw new TooManyRequestsException('Rate limit exceeded');
  }
  throw new InternalServerErrorException('External API call failed');
}
```

### Async Error Handling

**Pattern 1: Async/Await with Try-Catch**

```typescript
async processOrganization(id: string) {
  try {
    const org = await this.findById(id);
    const validated = await this.validate(org);
    return await this.process(validated);
  } catch (error) {
    throw ErrorUtil.wrapError(error, {
      operation: 'processOrganization',
      metadata: { id },
    });
  }
}
```

**Pattern 2: Promise.all for Parallel Operations**

```typescript
async getOrganizationDetails(id: string) {
  try {
    const [org, clinics, staff] = await Promise.all([
      this.findById(id),
      this.clinicsService.findByOrganization(id),
      this.staffService.findByOrganization(id),
    ]);

    return { org, clinics, staff };
  } catch (error) {
    throw ErrorUtil.wrapError(error, {
      operation: 'getOrganizationDetails',
      metadata: { id },
    });
  }
}
```

**Pattern 3: Promise.allSettled for Non-Critical Operations**

```typescript
async notifyStakeholders(organizationId: string) {
  const results = await Promise.allSettled([
    this.emailService.sendNotification(organizationId),
    this.smsService.sendNotification(organizationId),
    this.pushService.sendNotification(organizationId),
  ]);

  // Log failures but don't fail the operation
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      this.logger.warn(`Notification ${index} failed`, result.reason);
    }
  });
}
```

### Error Context Preservation

```typescript
// Preserve original error and add context
try {
  await operation();
} catch (originalError) {
  const wrappedError = ErrorUtil.wrapError(originalError, context);
  // originalError is preserved in wrappedError.cause
  throw wrappedError;
}
```

### Retry Logic in Catch Blocks

```typescript
async fetchWithRetry(url: string) {
  return ErrorUtil.retry(
    () => axios.get(url),
    {
      maxAttempts: 3,
      delayMs: 1000,
      backoffMultiplier: 2,
      shouldRetry: (error) => {
        // Custom retry logic
        return error.response?.status >= 500;
      },
    }
  );
}
```

---

## Business Rules

### Validation Rules Location

```
src/
├── modules/
│   └── organizations/
│       ├── rules/
│       │   ├── unique-tax-id.rule.ts
│       │   ├── subscription-tier-limits.rule.ts
│       │   └── organization-rules.validator.ts
│       └── organizations.service.ts
```

### Complex Business Logic Patterns

**Example: Organization Creation with Multiple Rules**

```typescript
// Rule 1: Unique tax ID
class UniqueTaxIdRule extends BusinessRuleBase<CreateOrganizationDto> {
  constructor(private repository: OrganizationRepository) {
    super('UniqueTaxIdRule', 10); // High priority
  }

  protected async evaluateRule(dto: CreateOrganizationDto): Promise<BusinessRuleResult> {
    const existing = await this.repository.findOne({ taxId: dto.taxId });

    if (existing) {
      return this.fail(
        'Organization with this tax ID already exists',
        'DUPLICATE_TAX_ID',
        { existingId: existing.id }
      );
    }

    return this.success();
  }
}

// Rule 2: Subscription tier limits
class SubscriptionTierLimitsRule extends BusinessRuleBase<CreateOrganizationDto> {
  protected evaluateRule(dto: CreateOrganizationDto): BusinessRuleResult {
    const tierLimits = {
      BASIC: { maxClinics: 1, maxUsers: 10 },
      STANDARD: { maxClinics: 5, maxUsers: 50 },
      PREMIUM: { maxClinics: -1, maxUsers: -1 }, // Unlimited
    };

    const limits = tierLimits[dto.subscriptionTier];

    if (dto.maxClinics > limits.maxClinics && limits.maxClinics !== -1) {
      return this.fail(
        `Max clinics for ${dto.subscriptionTier} tier is ${limits.maxClinics}`,
        'EXCEEDS_TIER_LIMITS'
      );
    }

    if (dto.maxUsers > limits.maxUsers && limits.maxUsers !== -1) {
      return this.fail(
        `Max users for ${dto.subscriptionTier} tier is ${limits.maxUsers}`,
        'EXCEEDS_TIER_LIMITS'
      );
    }

    return this.success();
  }
}

// Validator combining multiple rules
@Injectable()
export class OrganizationRulesValidator extends BusinessRuleValidator<CreateOrganizationDto> {
  constructor(repository: OrganizationRepository) {
    super([
      new UniqueTaxIdRule(repository),
      new SubscriptionTierLimitsRule(),
      // Add more rules as needed
    ]);
  }
}

// Usage in service
@Injectable()
export class OrganizationsService {
  constructor(private validator: OrganizationRulesValidator) {}

  async create(dto: CreateOrganizationDto, context: ServiceContext) {
    // Validate business rules
    const result = await this.validator.validate(dto);

    if (!result.isValid) {
      throw new BusinessRuleViolationException(result.failures);
    }

    // Proceed with creation
    // ...
  }
}
```

### Rule Engine Patterns

See `src/common/rules/business-rule.base.ts` for:
- `BusinessRuleBase` - Base class for all rules
- `AndBusinessRule` - All rules must pass
- `OrBusinessRule` - At least one rule must pass
- `NotBusinessRule` - Inverts rule result
- `BusinessRuleValidator` - Validates against multiple rules

### Workflow Patterns

**Example: Multi-step Organization Onboarding**

```typescript
interface OnboardingStep {
  name: string;
  execute(context: OnboardingContext): Promise<void>;
  rollback(context: OnboardingContext): Promise<void>;
}

class OnboardingWorkflow {
  private steps: OnboardingStep[] = [];

  addStep(step: OnboardingStep): this {
    this.steps.push(step);
    return this;
  }

  async execute(context: OnboardingContext): Promise<void> {
    const executedSteps: OnboardingStep[] = [];

    try {
      for (const step of this.steps) {
        await step.execute(context);
        executedSteps.push(step);
      }
    } catch (error) {
      // Rollback executed steps in reverse order
      for (const step of executedSteps.reverse()) {
        await step.rollback(context);
      }

      throw error;
    }
  }
}

// Usage
const workflow = new OnboardingWorkflow()
  .addStep(new CreateOrganizationStep())
  .addStep(new CreateDefaultClinicStep())
  .addStep(new AssignAdminRoleStep())
  .addStep(new SendWelcomeEmailStep());

await workflow.execute(context);
```

### State Machine Patterns

**Example: Organization Status Transitions**

```typescript
enum OrganizationStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

class OrganizationStateMachine {
  private static transitions: Record<OrganizationStatus, OrganizationStatus[]> = {
    [OrganizationStatus.PENDING]: [OrganizationStatus.ACTIVE, OrganizationStatus.ARCHIVED],
    [OrganizationStatus.ACTIVE]: [OrganizationStatus.SUSPENDED, OrganizationStatus.ARCHIVED],
    [OrganizationStatus.SUSPENDED]: [OrganizationStatus.ACTIVE, OrganizationStatus.ARCHIVED],
    [OrganizationStatus.ARCHIVED]: [], // Terminal state
  };

  static canTransition(from: OrganizationStatus, to: OrganizationStatus): boolean {
    return this.transitions[from]?.includes(to) || false;
  }

  static transition(
    organization: Organization,
    newStatus: OrganizationStatus,
  ): Organization {
    if (!this.canTransition(organization.status, newStatus)) {
      throw new InvalidStateTransitionException(
        `Cannot transition from ${organization.status} to ${newStatus}`
      );
    }

    organization.status = newStatus;
    return organization;
  }
}

// Usage in service
async updateStatus(id: string, newStatus: OrganizationStatus, context: ServiceContext) {
  const organization = await this.findById(id);

  const updated = OrganizationStateMachine.transition(organization, newStatus);
  await updated.save();

  this.emitEvent('organization.status.changed', {
    organizationId: id,
    oldStatus: organization.status,
    newStatus,
  }, context);

  return updated;
}
```

---

## Code Reusability

### Base Classes for Common Logic

**Available Base Classes:**
- `BaseService<T>` - Common service logic
- `BaseController` - Common controller logic
- `BaseRepository<T>` - Common repository logic
- `BusinessRuleBase<T>` - Common business rule logic

**When to Use:**
- Extend base classes for common patterns
- Override methods for custom behavior
- Call super methods for shared logic

**Example:**

```typescript
@Injectable()
export class OrganizationsService extends BaseService<OrganizationDocument> {
  constructor(
    @InjectModel(OrganizationDocument.name) model: Model<OrganizationDocument>,
    eventEmitter: EventEmitter2,
  ) {
    super(model, eventEmitter, OrganizationsService.name);
  }

  // Override for custom behavior
  async create(dto: CreateOrganizationDto, context: ServiceContext) {
    // Custom validation
    await this.validateUniqueTaxId(dto.taxId);

    // Call parent create
    const organization = await super.create(dto, context);

    // Custom post-creation logic
    await this.createDefaultClinic(organization.id, context);

    return organization;
  }

  // Custom methods
  private async validateUniqueTaxId(taxId: string) {
    const existing = await this.exists({ taxId });
    if (existing) {
      throw new ConflictException('Organization with this tax ID already exists');
    }
  }
}
```

### Mixins vs Inheritance

**Use Inheritance When:**
- Clear "is-a" relationship
- Single parent class
- Shared behavior across all subclasses

**Use Mixins When:**
- Multiple reusable behaviors
- Cross-cutting concerns
- No clear "is-a" relationship

**Mixin Example:**

```typescript
// Mixin for auditable entities
type Constructor<T = {}> = new (...args: any[]) => T;

function Auditable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    createdAt?: Date;
    createdBy?: string;
    updatedAt?: Date;
    updatedBy?: string;

    setCreatedBy(userId: string) {
      this.createdAt = new Date();
      this.createdBy = userId;
    }

    setUpdatedBy(userId: string) {
      this.updatedAt = new Date();
      this.updatedBy = userId;
    }
  };
}

// Usage
class Organization extends Auditable(BaseEntity) {
  name: string;
  // ... other fields
}

const org = new Organization();
org.setCreatedBy(userId);
```

### Composition Patterns

**Use Composition When:**
- "Has-a" relationship
- Delegating behavior
- Runtime behavior changes

**Example:**

```typescript
// Notification service composition
interface INotificationChannel {
  send(message: string, recipient: string): Promise<void>;
}

class EmailChannel implements INotificationChannel {
  async send(message: string, recipient: string) {
    // Send email
  }
}

class SMSChannel implements INotificationChannel {
  async send(message: string, recipient: string) {
    // Send SMS
  }
}

class NotificationService {
  constructor(private channels: INotificationChannel[]) {}

  async notify(message: string, recipient: string) {
    // Send through all channels in parallel
    await Promise.all(
      this.channels.map(channel => channel.send(message, recipient))
    );
  }

  addChannel(channel: INotificationChannel) {
    this.channels.push(channel);
  }
}

// Usage
const notificationService = new NotificationService([
  new EmailChannel(),
  new SMSChannel(),
]);

await notificationService.notify('Hello', 'user@example.com');
```

### Decorator Patterns

**Example: Method Caching Decorator**

```typescript
function Cacheable(ttlSeconds: number) {
  const cache = new Map<string, { data: unknown; expiry: number }>();

  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
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
  async getOrganizationMetrics(id: string) {
    // Expensive operation
    return await this.calculateMetrics(id);
  }
}
```

### Factory Patterns

**Example: Report Factory**

```typescript
interface IReport {
  generate(data: unknown): Promise<Buffer>;
}

class PDFReport implements IReport {
  async generate(data: unknown): Promise<Buffer> {
    // Generate PDF
    return Buffer.from('pdf');
  }
}

class ExcelReport implements IReport {
  async generate(data: unknown): Promise<Buffer> {
    // Generate Excel
    return Buffer.from('excel');
  }
}

class CSVReport implements IReport {
  async generate(data: unknown): Promise<Buffer> {
    // Generate CSV
    return Buffer.from('csv');
  }
}

class ReportFactory {
  static create(type: 'pdf' | 'excel' | 'csv'): IReport {
    switch (type) {
      case 'pdf':
        return new PDFReport();
      case 'excel':
        return new ExcelReport();
      case 'csv':
        return new CSVReport();
      default:
        throw new Error(`Unknown report type: ${type}`);
    }
  }
}

// Usage
const report = ReportFactory.create('pdf');
const buffer = await report.generate(data);
```

---

## Testing Standards

### Unit Testing Services

```typescript
describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let model: Model<OrganizationDocument>;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: getModelToken(OrganizationDocument.name),
          useValue: mockModel,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get(OrganizationsService);
    model = module.get(getModelToken(OrganizationDocument.name));
    eventEmitter = module.get(EventEmitter2);
  });

  describe('create', () => {
    it('should create organization and emit event', async () => {
      const dto = { name: 'Test Org', /* ... */ };
      const context = { userId: 'user1' };

      const result = await service.create(dto, context);

      expect(result).toBeDefined();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'enterprise.organization.created',
        expect.objectContaining({ name: 'Test Org' })
      );
    });

    it('should throw error if tax ID already exists', async () => {
      model.findOne = vi.fn().mockResolvedValue({ taxId: 'RO12345678' });

      await expect(
        service.create({ taxId: 'RO12345678', /* ... */ }, { userId: 'user1' })
      ).rejects.toThrow(ConflictException);
    });
  });
});
```

### Testing Business Rules

```typescript
describe('UniqueTaxIdRule', () => {
  let rule: UniqueTaxIdRule;
  let repository: OrganizationRepository;

  beforeEach(() => {
    repository = {
      findOne: vi.fn(),
    } as unknown as OrganizationRepository;

    rule = new UniqueTaxIdRule(repository);
  });

  it('should pass if tax ID is unique', async () => {
    repository.findOne = vi.fn().mockResolvedValue(null);

    const result = await rule.evaluate({ taxId: 'RO12345678' });

    expect(result.isValid).toBe(true);
  });

  it('should fail if tax ID already exists', async () => {
    repository.findOne = vi.fn().mockResolvedValue({ id: 'existing' });

    const result = await rule.evaluate({ taxId: 'RO12345678' });

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe('DUPLICATE_TAX_ID');
  });
});
```

---

## Examples

See `src/common/patterns/README.md` for comprehensive design pattern examples.

---

## Summary

This document defines the standards for:

1. **Logic Organization:** Services, repositories, controllers separation
2. **Utilities:** Date, string, validation, transformation, error utilities
3. **Middleware:** Request logging, response time, compression, security
4. **Error Handling:** Try-catch patterns, error wrapping, retry logic
5. **Business Rules:** Specification pattern, rule composition, validation
6. **Code Reusability:** Base classes, mixins, composition, decorators, factories

Follow these standards to maintain consistency, quality, and maintainability across the Enterprise Service.
