# Common Module

This directory contains shared functionality used across the Enterprise Service.

## Directory Structure

```
common/
├── base/                    # Base classes for inheritance
│   ├── base.service.ts      # Base service with CRUD operations
│   ├── base.controller.ts   # Base controller with request handling
│   ├── base.repository.ts   # Base repository (Repository pattern)
│   └── index.ts
├── middleware/              # Custom middleware
│   ├── request-context.middleware.ts    # Extract request context
│   ├── response-time.middleware.ts      # Measure response time
│   ├── compression.middleware.ts        # Response compression
│   ├── security.middleware.ts           # Security configurations
│   └── index.ts
├── rules/                   # Business rules engine
│   ├── business-rule.interface.ts       # Rule interfaces
│   ├── business-rule.base.ts            # Base rule classes
│   └── index.ts
├── utils/                   # Utility functions
│   ├── date.util.ts         # Date/time operations
│   ├── string.util.ts       # String manipulation
│   ├── validation.util.ts   # Validation helpers
│   ├── transformation.util.ts  # Data transformation
│   ├── error.util.ts        # Error handling
│   └── index.ts
├── patterns/                # Design pattern documentation
│   └── README.md
├── validators/              # Custom validators (future)
├── index.ts                 # Main export
└── README.md               # This file
```

## Usage

### Importing Utilities

```typescript
import { DateUtil, StringUtil, ValidationUtil } from '@/common/utils';

// Date operations
const now = DateUtil.now('Europe/Bucharest');
const formatted = DateUtil.format(date, 'ro-RO');

// String operations
const slug = StringUtil.slugify('Ștefan Cel Mare');
const masked = StringUtil.maskEmail('user@example.com');

// Validation
const isValid = ValidationUtil.isEmail(email);
const result = ValidationUtil.validateObject(data, rules);
```

### Using Base Classes

```typescript
import { BaseService, BaseController, BaseRepository } from '@/common/base';

@Injectable()
export class OrganizationsService extends BaseService<OrganizationDocument> {
  constructor(
    @InjectModel(OrganizationDocument.name) model: Model<OrganizationDocument>,
    eventEmitter: EventEmitter2,
  ) {
    super(model, eventEmitter, OrganizationsService.name);
  }

  // Your custom methods here
}
```

### Implementing Business Rules

```typescript
import { BusinessRuleBase, BusinessRuleValidator } from '@/common/rules';

class UniqueTaxIdRule extends BusinessRuleBase<CreateOrganizationDto> {
  constructor(private repository: OrganizationRepository) {
    super('UniqueTaxIdRule', 10);
  }

  protected async evaluateRule(dto: CreateOrganizationDto) {
    const existing = await this.repository.findOne({ taxId: dto.taxId });

    if (existing) {
      return this.fail('Organization with this tax ID already exists', 'DUPLICATE_TAX_ID');
    }

    return this.success();
  }
}

// Use in service
const validator = new BusinessRuleValidator([
  new UniqueTaxIdRule(repository),
  // ... more rules
]);

const result = await validator.validate(dto);
```

### Applying Middleware

```typescript
import {
  RequestContextMiddleware,
  ResponseTimeMiddleware,
  compressionMiddleware
} from '@/common/middleware';

// In module
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
app.use(compressionMiddleware);
```

## Key Features

### Utilities

#### DateUtil
- Timezone conversions
- Business hours calculations
- Date formatting (Romanian locale)
- Age calculations
- Fiscal year calculations
- Working days calculations

#### StringUtil
- Romanian diacritics handling
- XSS prevention (HTML escaping)
- Email/phone validation and formatting
- Romanian CUI validation
- String transformations (camelCase, snake_case, kebab-case)
- Masking sensitive data

#### ValidationUtil
- Type validations
- Range validations
- Format validations (email, phone, CUI, UUID, ObjectId)
- Object validation with rules
- Sanitization

#### TransformationUtil
- DTO transformations
- Pagination helpers
- Deep cloning and merging
- Key/value transformations
- Flattening and unflattening objects

#### ErrorUtil
- Error wrapping with context
- Retry logic with exponential backoff
- Error categorization
- Error aggregation
- Async error handling

### Base Classes

#### BaseService<T>
- CRUD operations (findAll, findById, create, update, delete)
- Pagination support
- Transaction support
- Event emission
- Audit trail support (createdBy, updatedBy)
- Soft delete support

#### BaseController
- Request context extraction
- Pagination parsing
- Filter extraction
- Response formatting
- Validation helpers

#### BaseRepository<T>
- Data access abstraction
- CRUD operations
- Pagination support
- Transaction support
- Aggregation support

### Business Rules

#### BusinessRuleBase<T>
- Template method pattern
- Error handling
- Logging
- Success/fail helpers

#### Composite Rules
- `AndBusinessRule` - All rules must pass
- `OrBusinessRule` - At least one rule must pass
- `NotBusinessRule` - Inverts rule result

#### BusinessRuleValidator
- Validates against multiple rules
- Sorts by priority
- Collects all failures
- Structured validation results

## Best Practices

1. **Always use utilities instead of reimplementing:**
   - Use `DateUtil` for date operations
   - Use `StringUtil` for string operations
   - Use `ValidationUtil` for validations
   - Use `ErrorUtil` for error handling

2. **Extend base classes for common patterns:**
   - Extend `BaseService` for services
   - Extend `BaseController` for controllers
   - Extend `BaseRepository` for repositories

3. **Use business rules for complex validation:**
   - Keep rules small and focused
   - Compose rules with AND/OR
   - Use validators to combine multiple rules

4. **Apply middleware consistently:**
   - Use request context middleware for all routes
   - Use response time middleware for performance monitoring
   - Use compression middleware for bandwidth optimization

5. **Follow error handling patterns:**
   - Wrap errors with context
   - Use retry logic for transient failures
   - Categorize errors (operational vs programmer)

## Documentation

For detailed documentation, see:
- [Business Logic Standards](../../BUSINESS_LOGIC_STANDARDS.md)
- [Design Patterns](./patterns/README.md)

## Contributing

When adding new common functionality:

1. Follow existing patterns and conventions
2. Add comprehensive JSDoc comments
3. Include edge case handling
4. Add unit tests
5. Update this README
6. Update BUSINESS_LOGIC_STANDARDS.md

## Testing

All common utilities and base classes have comprehensive unit tests:

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- date.util.spec.ts

# Run with coverage
npm run test:coverage
```

## Examples

See [BUSINESS_LOGIC_STANDARDS.md](../../BUSINESS_LOGIC_STANDARDS.md) for comprehensive examples of:
- Service implementation
- Controller implementation
- Repository implementation
- Business rule implementation
- Middleware usage
- Error handling patterns
