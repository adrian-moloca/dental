# Business Logic & Utilities Quick Reference

Quick reference for common operations using the business logic and utilities infrastructure.

## Import Patterns

```typescript
// Utilities
import { DateUtil, StringUtil, ValidationUtil, TransformationUtil, ErrorUtil } from '@/common/utils';

// Base classes
import { BaseService, BaseController, BaseRepository } from '@/common/base';

// Business rules
import { BusinessRuleBase, BusinessRuleValidator, AndBusinessRule, OrBusinessRule } from '@/common/rules';

// Middleware
import { RequestContextMiddleware, ResponseTimeMiddleware, compressionMiddleware } from '@/common/middleware';
```

## Common Operations

### Date Operations

```typescript
// Current time in Romania
const now = DateUtil.now('Europe/Bucharest');

// Format dates
const formatted = DateUtil.format(date, 'ro-RO'); // 24.11.2025 14:30:00
const dateOnly = DateUtil.formatDate(date); // 24.11.2025

// Business hours
const isBusinessHours = DateUtil.isBusinessHours(date);
const nextBusinessDay = DateUtil.addBusinessDays(date, 1);

// Age calculation
const age = DateUtil.calculateAge(birthDate);

// Date arithmetic
const nextWeek = DateUtil.addDays(date, 7);
const nextMonth = DateUtil.addMonths(date, 1);
```

### String Operations

```typescript
// Romanian diacritics
const normalized = StringUtil.removeDiacritics('Ștefan'); // Stefan
const slug = StringUtil.slugify('Ștefan Cel Mare'); // stefan-cel-mare

// Validation
const isValidEmail = StringUtil.isValidEmail('test@example.com');
const isValidPhone = StringUtil.isValidPhone('0722123456');
const isValidCUI = StringUtil.isValidCUI('RO12345678');

// Formatting
const formattedPhone = StringUtil.formatPhone('0722123456'); // 0722 123 456
const formattedCUI = StringUtil.formatCUI('12345678'); // RO12345678

// Security
const safe = StringUtil.escapeHtml(userInput);
const masked = StringUtil.maskEmail('user@example.com'); // u***@example.com
```

### Validation

```typescript
// Type checks
ValidationUtil.isString(value);
ValidationUtil.isNumber(value);
ValidationUtil.isNotEmpty(value);

// Format validation
ValidationUtil.isEmail(email);
ValidationUtil.isPhone(phone);
ValidationUtil.isCUI(cui);
ValidationUtil.isObjectId(id);

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

### Transformation

```typescript
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
const camelCase = TransformationUtil.toCamelCase(snakeObject);
const snakeCase = TransformationUtil.toSnakeCase(camelObject);
```

### Error Handling

```typescript
// Error wrapping
try {
  await operation();
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
  5000,
  'Operation timed out'
);

// Safe execution
const { success, data, error } = await ErrorUtil.tryCatch(
  () => riskyOperation()
);
```

## Service Implementation

```typescript
@Injectable()
export class OrganizationsService extends BaseService<OrganizationDocument> {
  constructor(
    @InjectModel(OrganizationDocument.name)
    model: Model<OrganizationDocument>,
    eventEmitter: EventEmitter2,
  ) {
    super(model, eventEmitter, OrganizationsService.name);
  }

  // Custom business logic
  async create(dto: CreateOrganizationDto, context: ServiceContext) {
    // 1. Validate
    await this.validateUniqueTaxId(dto.taxId);

    // 2. Create with audit trail
    const organization = await super.create(dto, context);

    // 3. Emit event
    this.emitEvent('enterprise.organization.created', {
      organizationId: organization._id.toString(),
      name: organization.name,
    }, context);

    return organization;
  }

  // Use base class methods
  async findAll(filter: OrganizationFilterDto, context: ServiceContext) {
    return super.findAllPaginated(filter, {
      limit: filter.limit,
      offset: filter.offset,
      sort: { createdAt: -1 },
    });
  }
}
```

## Controller Implementation

```typescript
@Controller('organizations')
export class OrganizationsController extends BaseController {
  constructor(private service: OrganizationsService) {
    super('OrganizationsController');
  }

  @Get()
  async findAll(@Req() req: Request) {
    const context = this.getContext(req);
    const pagination = this.getPaginationOptions(req);
    const filter = this.getFilter(req);

    return this.service.findAll(filter, pagination, context);
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateOrganizationDto) {
    const context = this.getContext(req);
    return this.service.create(dto, context);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    if (!this.isValidId(id)) {
      throw new BadRequestException('Invalid organization ID');
    }

    const context = this.getContext(req);
    return this.service.findById(id);
  }
}
```

## Business Rules

```typescript
// Define rule
class UniqueTaxIdRule extends BusinessRuleBase<CreateOrganizationDto> {
  constructor(private repository: OrganizationRepository) {
    super('UniqueTaxIdRule', 10); // name, priority
  }

  protected async evaluateRule(dto: CreateOrganizationDto) {
    const existing = await this.repository.findOne({ taxId: dto.taxId });

    if (existing) {
      return this.fail(
        'Organization with this tax ID already exists',
        'DUPLICATE_TAX_ID'
      );
    }

    return this.success();
  }
}

// Compose rules
const validator = new BusinessRuleValidator([
  new UniqueTaxIdRule(repository),
  new SubscriptionTierLimitsRule(),
  // ... more rules
]);

// Validate
const result = await validator.validate(dto);

if (!result.isValid) {
  throw new BusinessRuleViolationException(result.failures);
}
```

## Middleware Usage

```typescript
// In app.module.ts
@Module({
  providers: [RequestContextMiddleware, ResponseTimeMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware, ResponseTimeMiddleware)
      .forRoutes('*');
  }
}

// In main.ts
import { compressionMiddleware, getCorsConfig, getHelmetConfig } from '@/common/middleware';

// Compression
app.use(compressionMiddleware);

// Security
app.use(getHelmetConfig(isDevelopment));

// CORS
const corsConfig = getCorsConfig(
  configService.get('CORS_ORIGIN'),
  isDevelopment
);
app.enableCors(corsConfig);
```

## Common Patterns

### Pagination

```typescript
// In controller
const pagination = this.getPaginationOptions(req);
// { limit: 20, offset: 0, sort: { createdAt: -1 } }

// In service
const result = await this.findAllPaginated(filter, pagination);
// { data: [...], meta: { total, page, limit, totalPages, hasNextPage, hasPreviousPage } }
```

### Transaction

```typescript
// In service
await this.withTransaction(async (session) => {
  const org = await this.create(orgDto, context);
  await this.clinicsService.createDefault(org.id, context, session);
  await this.rbacService.assignAdmin(userId, org.id, session);

  // Automatically commits on success, rolls back on error
});
```

### Event Emission

```typescript
// In service
this.emitEvent('enterprise.organization.created', {
  organizationId: organization._id.toString(),
  name: organization.name,
  createdAt: organization.createdAt.toISOString(),
}, context);
```

### Error Wrapping

```typescript
try {
  await externalApiCall();
} catch (error) {
  throw ErrorUtil.wrapError(error, {
    operation: 'callExternalAPI',
    correlationId: context.correlationId,
    metadata: { url, payload },
  });
}
```

## Romanian-Specific Features

### CUI Validation

```typescript
// Validate Romanian tax ID with checksum
const isValid = StringUtil.isValidCUI('RO12345678');

// Format CUI
const formatted = StringUtil.formatCUI('12345678'); // RO12345678
```

### Phone Number Handling

```typescript
// Validate Romanian phone
const isValid = StringUtil.isValidPhone('0722123456');
const isValid2 = StringUtil.isValidPhone('+40722123456');

// Format phone
const formatted = StringUtil.formatPhone('0722123456'); // 0722 123 456
const formatted2 = StringUtil.formatPhone('+40722123456'); // +40 722 123 456
```

### Date Handling

```typescript
// Romania timezone
const now = DateUtil.now('Europe/Bucharest');

// Business hours (Romanian)
const isOpen = DateUtil.isBusinessHours(date, {
  startHour: 9,
  endHour: 17,
  workingDays: [1, 2, 3, 4, 5], // Mon-Fri
  timezone: 'Europe/Bucharest',
});

// Fiscal year (Romania = calendar year)
const fiscalYear = DateUtil.getFiscalYear(date); // 2025
```

## Testing

```typescript
describe('OrganizationsService', () => {
  let service: OrganizationsService;

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
  });

  it('should create organization', async () => {
    const dto = { name: 'Test', /* ... */ };
    const context = { userId: 'user1' };

    const result = await service.create(dto, context);

    expect(result).toBeDefined();
    expect(result.name).toBe('Test');
  });
});
```

## Documentation

For complete documentation:
- **Full Standards:** `BUSINESS_LOGIC_STANDARDS.md`
- **Implementation Details:** `BUSINESS_LOGIC_IMPLEMENTATION.md`
- **Common Module:** `src/common/README.md`
- **Design Patterns:** `src/common/patterns/README.md`
