# Security Quick Start Guide
## Backend Enterprise Service

This guide will help you integrate all security components in 15 minutes.

---

## Step 1: Environment Configuration (5 minutes)

```bash
# Copy security template
cp .env.security.example .env

# Generate JWT secret
openssl rand -base64 64

# Edit .env and set:
# - JWT_SECRET=<generated-value>
# - NODE_ENV=production
# - MONGODB_URI (with TLS)
# - REDIS_PASSWORD
# - CORS_ORIGIN (restrict to your domain)
```

---

## Step 2: Apply Guards to Controllers (5 minutes)

### Update Organizations Controller

**File:** `/src/modules/organizations/organizations.controller.ts`

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TenantIsolationGuard } from '../../guards/tenant-isolation.guard';
import { RequirePermissions } from '../../guards/permissions.guard';

@Controller('enterprise/organizations')
@UseGuards(JwtAuthGuard, TenantIsolationGuard)  // ← ADD THIS
export class OrganizationsController {
  @Post()
  @RequirePermissions('organization:write')  // ← ADD THIS
  async create(@Body() dto: CreateOrganizationDto) {
    // ...
  }

  @Get()
  @RequirePermissions('organization:read')  // ← ADD THIS
  async findAll(@Query() filter: OrganizationFilterDto) {
    // ...
  }

  @Patch(':id')
  @RequirePermissions('organization:write')  // ← ADD THIS
  async update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    // ...
  }
}
```

### Apply to All Controllers

Repeat for:
- `/src/modules/clinics/clinics.controller.ts`
- `/src/modules/assignments/assignments.controller.ts`
- `/src/modules/rbac/rbac.controller.ts`

**Pattern:**
```typescript
@Controller('...')
@UseGuards(JwtAuthGuard, TenantIsolationGuard)
export class YourController {
  @Post()
  @RequirePermissions('resource:write')
  async create() { ... }

  @Get()
  @RequirePermissions('resource:read')
  async findAll() { ... }
}
```

---

## Step 3: Enable Middleware & Interceptors (3 minutes)

### Update main.ts

**File:** `/src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { SanitizationMiddleware, RequestSizeLimitMiddleware } from './middleware';
import { TenantQueryInterceptor } from './interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet({
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    frameguard: { action: 'deny' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  }));

  // Input sanitization (ADD THIS)
  app.use(new SanitizationMiddleware().use);
  app.use(new RequestSizeLimitMiddleware().use);

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global interceptors (ADD THIS)
  app.useGlobalInterceptors(new TenantQueryInterceptor());

  // ... rest of your configuration

  await app.listen(process.env.PORT || 3017);
}

bootstrap();
```

---

## Step 4: Create Audit Log Collection (2 minutes)

### MongoDB Shell

```javascript
use enterprise;

// Create collection
db.createCollection('audit_logs');

// Create indexes
db.audit_logs.createIndex({ eventType: 1, timestamp: -1 });
db.audit_logs.createIndex({ userId: 1, timestamp: -1 });
db.audit_logs.createIndex({ organizationId: 1, timestamp: -1 });
db.audit_logs.createIndex({ correlationId: 1 });
db.audit_logs.createIndex({ hash: 1 }, { unique: true });
db.audit_logs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 220752000 }); // 7 years
```

### Register Audit Log Module

**File:** `/src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogService, AuditLogSchema } from './services';

@Module({
  imports: [
    // ... existing imports
    MongooseModule.forFeature([
      { name: 'AuditLog', schema: AuditLogSchema },
    ]),
  ],
  providers: [
    AuditLogService,  // ← ADD THIS
  ],
  exports: [
    AuditLogService,  // ← ADD THIS
  ],
})
export class AppModule {}
```

---

## Step 5: Test Security (Optional, 5 minutes)

```bash
# Run security test suite
npm run test:security

# Test authentication
curl -X GET http://localhost:3017/api/v1/enterprise/organizations
# Expected: 401 Unauthorized

# Test with token
curl -X GET http://localhost:3017/api/v1/enterprise/organizations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
# Expected: 200 OK (if token valid)

# Test rate limiting
for i in {1..150}; do
  curl http://localhost:3017/api/v1/health
done
# Expected: Some requests return 429 Too Many Requests

# Test input sanitization
curl -X POST http://localhost:3017/api/v1/enterprise/organizations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "<script>alert(\"XSS\")</script>", "legalName": "Test"}'
# Expected: XSS payload sanitized
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] Environment variables set correctly
- [ ] All controllers have `@UseGuards(JwtAuthGuard, TenantIsolationGuard)`
- [ ] Sensitive operations have `@RequirePermissions(...)` decorator
- [ ] Sanitization middleware enabled in `main.ts`
- [ ] TenantQueryInterceptor registered globally
- [ ] Audit log collection created with indexes
- [ ] AuditLogService registered in AppModule
- [ ] Tests passing (`npm run test:security`)

---

## Common Issues & Solutions

### Issue: "JWT_SECRET is not defined"
**Solution:** Ensure `.env` file exists and `JWT_SECRET` is set.

```bash
# Generate new secret
openssl rand -base64 64

# Add to .env
echo "JWT_SECRET=<generated-value>" >> .env
```

### Issue: "MongoDB connection failed"
**Solution:** Check `MONGODB_URI` and ensure TLS is enabled.

```bash
# Verify connection
mongosh "YOUR_MONGODB_URI"

# Ensure URI contains:
# - retryWrites=true
# - w=majority
# - tls=true (for production)
```

### Issue: "Redis connection failed"
**Solution:** Check Redis credentials and network access.

```bash
# Test Redis connection
redis-cli -h YOUR_REDIS_HOST -p YOUR_REDIS_PORT -a YOUR_REDIS_PASSWORD ping
# Expected: PONG
```

### Issue: "Rate limiting not working"
**Solution:** Ensure Redis is running and `RATE_LIMIT_ENABLED=true`.

```bash
# Check Redis
redis-cli -h localhost -p 6379 KEYS "rate-limit:*"

# Verify environment variable
grep RATE_LIMIT_ENABLED .env
```

### Issue: "Audit logs not being created"
**Solution:** Verify MongoDB collection and AuditLogService registration.

```javascript
// Check collection exists
db.getCollectionNames().includes('audit_logs')

// Check indexes
db.audit_logs.getIndexes()
```

---

## Next Steps

1. **Review Security Documentation**
   - Read `SECURITY.md` for comprehensive guide
   - Understand threat model and mitigations

2. **Configure Monitoring**
   - Set up CloudWatch or Datadog
   - Create security event alerts
   - Build audit log dashboard

3. **Implement MFA**
   - Add TOTP support
   - Enforce for admin users
   - Configure backup codes

4. **Run Penetration Test**
   - Hire security firm or use internal team
   - Test all OWASP Top 10 vectors
   - Fix any findings

5. **Schedule Security Review**
   - Quarterly penetration testing
   - Monthly dependency updates
   - Weekly audit log review

---

## Support

**Questions?**
- Slack: #security-team
- Email: security@dentalos.com

**Security Issues?**
- Critical: Call on-call engineer immediately
- High: Email security@dentalos.com within 1 hour
- Medium/Low: Create Jira ticket

**Documentation:**
- Comprehensive Guide: `/SECURITY.md`
- Implementation Summary: `/SECURITY_IMPLEMENTATION_SUMMARY.md`
- Configuration Template: `/.env.security.example`

---

**Quick Start Complete!** 🎉

Your service is now protected with:
- ✅ JWT Authentication
- ✅ RBAC/ABAC Authorization
- ✅ Multi-Tenant Isolation
- ✅ Input Sanitization
- ✅ Rate Limiting
- ✅ Audit Logging
- ✅ Database Security

**Next:** Deploy with confidence! 🚀
