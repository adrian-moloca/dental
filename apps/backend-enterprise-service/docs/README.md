# DentalOS Enterprise Service Documentation

Complete API documentation for the DentalOS Multi-Clinic & Enterprise Management Service.

## Quick Links

- **Swagger UI**: http://localhost:3002/api-docs
- **OpenAPI Spec (JSON)**: http://localhost:3002/api-docs-json
- **Service Health**: http://localhost:3002/health

## Documentation Files

### [API-DOCUMENTATION.md](./API-DOCUMENTATION.md)

Comprehensive API documentation with:
- Complete endpoint reference
- Request/response examples
- cURL command examples
- Authentication guide
- Error handling reference
- Rate limiting information
- Complete workflow examples

**Use this for**: API integration, client development, testing

### [SWAGGER-IMPLEMENTATION-SUMMARY.md](./SWAGGER-IMPLEMENTATION-SUMMARY.md)

Technical summary of the Swagger/OpenAPI implementation:
- Implementation checklist
- File structure
- Statistics (19 endpoints, 30+ DTOs)
- Best practices followed
- Usage instructions

**Use this for**: Understanding the documentation structure, maintenance

## Getting Started

### 1. Start the Service

```bash
cd apps/backend-enterprise-service
npm install
npm run start:dev
```

### 2. Access Interactive Documentation

Open your browser to:
```
http://localhost:3002/api-docs
```

### 3. Authenticate

1. Click the "Authorize" button in Swagger UI
2. Enter your JWT token: `Bearer <your_token>`
3. Click "Authorize" then "Close"
4. Your token is now saved and will be included in all requests

### 4. Try an Endpoint

1. Expand any endpoint (e.g., `GET /enterprise/organizations`)
2. Click "Try it out"
3. Click "Execute"
4. View the response

## API Overview

### Base URL

- **Local Development**: `http://localhost:3002/api/v1`
- **Staging**: `https://api-staging.dentalos.com/api/v1`
- **Production**: `https://api.dentalos.com/api/v1`

### Authentication

All endpoints require Bearer token authentication:

```http
Authorization: Bearer <your_jwt_token>
```

### Endpoints by Category

#### Organizations (7 endpoints)
- Create, list, get, update organizations
- Manage organization settings
- Manage organization administrators

#### Clinics (7 endpoints)
- Create, list, get, update clinics
- Manage clinic settings
- Manage clinic locations/rooms

#### Provider-Clinic Assignments (3 endpoints)
- Assign providers to clinics
- List provider's clinics
- List clinic's staff

#### RBAC (2 endpoints)
- Create custom roles
- List permissions and roles

**Total: 19 fully documented endpoints**

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-01-24T10:30:00.000Z",
  "correlationId": "abc123-def456"
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["field1 is required", "field2 must be an email"],
  "path": "/api/v1/enterprise/organizations",
  "timestamp": "2025-01-24T10:30:00.000Z",
  "correlationId": "abc123-def456"
}
```

## Example Workflow

Complete example of creating an organization and clinic:

```bash
# Set environment
export TOKEN="your_jwt_token"
export API_URL="http://localhost:3002/api/v1"

# 1. Create organization
curl -X POST "${API_URL}/enterprise/organizations" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smile Dental Group",
    "legalName": "Smile Dental Group, LLC",
    "taxId": "12-3456789",
    "primaryContactName": "Dr. John Smith",
    "primaryContactEmail": "john@smiledental.com",
    "primaryContactPhone": "+1-415-555-0123",
    "address": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "postalCode": "94102",
      "country": "USA"
    },
    "subscriptionTier": "PRO",
    "subscriptionStartDate": "2025-01-01T00:00:00.000Z",
    "maxClinics": 10,
    "maxUsers": 100,
    "maxStorageGB": 500
  }'

# Save the organization ID from response
export ORG_ID="<org_id_from_response>"

# 2. Create clinic
curl -X POST "${API_URL}/enterprise/organizations/${ORG_ID}/clinics" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smile Dental - Downtown",
    "code": "SDG-DT-001",
    "address": {
      "street": "456 Market St",
      "city": "San Francisco",
      "state": "CA",
      "postalCode": "94103",
      "country": "USA"
    },
    "phone": "+1-415-555-1000",
    "email": "downtown@smiledental.com",
    "timezone": "America/Los_Angeles",
    "locale": "en-US"
  }'
```

See [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) for complete examples.

## Common Use Cases

### Multi-Clinic Organization Setup

1. Create organization
2. Create multiple clinics under the organization
3. Configure organization-wide settings (branding, security)
4. Configure clinic-specific settings
5. Assign providers to clinics
6. Add organization administrators

### Provider Management

1. Assign provider to primary clinic
2. Assign provider to additional clinics (part-time)
3. Set custom working hours per clinic
4. Assign roles (DENTIST, HYGIENIST, etc.)
5. View provider's clinic list
6. View clinic's staff list

### Access Control

1. Create custom enterprise roles
2. Assign organization administrators
3. Set clinic managers
4. Configure permissions per role
5. Audit access using RBAC endpoints

## Import to Tools

### Postman

1. Open Postman
2. Click "Import"
3. Select "Link" tab
4. Enter: `http://localhost:3002/api-docs-json`
5. Click "Continue" and "Import"

### Insomnia

1. Open Insomnia
2. Go to "Design" tab
3. Click "Import"
4. Select "From URL"
5. Enter: `http://localhost:3002/api-docs-json`

### Generate Client SDK

```bash
# TypeScript/JavaScript
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:3002/api-docs-json \
  -g typescript-axios \
  -o ./sdks/typescript

# Python
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:3002/api-docs-json \
  -g python \
  -o ./sdks/python
```

## Rate Limits

| Subscription Tier | Requests per Minute |
|------------------|---------------------|
| FREE             | 100                 |
| BASIC            | 500                 |
| PRO              | 2,000               |
| ENTERPRISE       | 10,000              |

Rate limit headers:
```http
X-RateLimit-Limit: 2000
X-RateLimit-Remaining: 1999
X-RateLimit-Reset: 1611500400
```

## Error Codes

| Status Code | Meaning                          |
|-------------|----------------------------------|
| 200         | Success                          |
| 201         | Created                          |
| 400         | Bad Request / Validation Error   |
| 401         | Unauthorized                     |
| 403         | Forbidden / Insufficient Permissions |
| 404         | Not Found                        |
| 409         | Conflict / Duplicate             |
| 429         | Too Many Requests                |
| 500         | Internal Server Error            |

## Support

- **Documentation**: https://docs.dentalos.com
- **API Status**: https://status.dentalos.com
- **Support Email**: support@dentalos.com
- **Slack Channel**: #api-support

## Contributing

When adding new endpoints:

1. Create DTOs in `src/dto/` with full `@ApiProperty` decorators
2. Add Swagger decorators to controller methods:
   - `@ApiOperation` with summary and description
   - `@ApiParam` for path parameters
   - `@ApiQuery` for query parameters
   - `@ApiBody` with examples
   - `@ApiResponse` for all status codes
3. Update this documentation
4. Test in Swagger UI
5. Generate updated OpenAPI spec

## Changelog

### v1.0.0 (2025-01-24)

- Initial release with complete Swagger documentation
- 19 endpoints across 4 domains
- 30+ fully documented DTOs
- Comprehensive examples and error documentation
- Interactive Swagger UI
- Auto-generated OpenAPI spec
