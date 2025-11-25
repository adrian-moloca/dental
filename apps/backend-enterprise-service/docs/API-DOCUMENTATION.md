# DentalOS Enterprise Service - API Documentation

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Organizations API](#organizations-api)
- [Clinics API](#clinics-api)
- [Provider-Clinic Assignments API](#provider-clinic-assignments-api)
- [RBAC API](#rbac-api)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Overview

The DentalOS Enterprise Service provides comprehensive multi-clinic and enterprise management capabilities for dental organizations. This service handles:

- Multi-tenant organization management
- Multi-clinic management and configuration
- Provider-to-clinic assignments with roles
- Enterprise-level role-based access control (RBAC)

**Base URL:**
- Local Development: `http://localhost:3002/api/v1`
- Staging: `https://api-staging.dentalos.com/api/v1`
- Production: `https://api.dentalos.com/api/v1`

**OpenAPI Documentation:**
- Interactive Swagger UI: `http://localhost:3002/api-docs`
- OpenAPI JSON Spec: `http://localhost:3002/api-docs-json`

## Authentication

All API endpoints require Bearer token authentication.

### Request Headers

```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
X-Correlation-ID: optional-correlation-id
X-Organization-ID: optional-organization-context
X-Clinic-ID: optional-clinic-context
```

### Example with cURL

```bash
export TOKEN="your_jwt_token_here"
export API_URL="http://localhost:3002/api/v1"

curl -X GET "${API_URL}/enterprise/organizations" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json"
```

---

## Organizations API

### 1. Create Organization

Creates a new multi-tenant organization.

**Endpoint:** `POST /enterprise/organizations`

**Request Body:**

```json
{
  "name": "Smile Dental Group",
  "legalName": "Smile Dental Group, LLC",
  "taxId": "12-3456789",
  "primaryContactName": "Dr. John Smith",
  "primaryContactEmail": "john.smith@smiledental.com",
  "primaryContactPhone": "+1-415-555-0123",
  "address": {
    "street": "123 Main Street",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94102",
    "country": "United States"
  },
  "website": "https://www.smiledental.com",
  "subscriptionTier": "PRO",
  "subscriptionStartDate": "2025-01-01T00:00:00.000Z",
  "maxClinics": 10,
  "maxUsers": 100,
  "maxStorageGB": 500
}
```

**cURL Example:**

```bash
curl -X POST "${API_URL}/enterprise/organizations" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smile Dental Group",
    "legalName": "Smile Dental Group, LLC",
    "taxId": "12-3456789",
    "primaryContactName": "Dr. John Smith",
    "primaryContactEmail": "john.smith@smiledental.com",
    "primaryContactPhone": "+1-415-555-0123",
    "address": {
      "street": "123 Main Street",
      "city": "San Francisco",
      "state": "CA",
      "postalCode": "94102",
      "country": "United States"
    },
    "website": "https://www.smiledental.com",
    "subscriptionTier": "PRO",
    "subscriptionStartDate": "2025-01-01T00:00:00.000Z",
    "maxClinics": 10,
    "maxUsers": 100,
    "maxStorageGB": 500
  }'
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Smile Dental Group",
    "legalName": "Smile Dental Group, LLC",
    "taxId": "12-3456789",
    "status": "PENDING",
    "primaryContactName": "Dr. John Smith",
    "primaryContactEmail": "john.smith@smiledental.com",
    "primaryContactPhone": "+1-415-555-0123",
    "address": {
      "street": "123 Main Street",
      "city": "San Francisco",
      "state": "CA",
      "postalCode": "94102",
      "country": "United States"
    },
    "website": "https://www.smiledental.com",
    "subscriptionTier": "PRO",
    "subscriptionStartDate": "2025-01-01T00:00:00.000Z",
    "maxClinics": 10,
    "maxUsers": 100,
    "maxStorageGB": 500,
    "createdAt": "2025-01-24T10:30:00.000Z",
    "updatedAt": "2025-01-24T10:30:00.000Z"
  },
  "timestamp": "2025-01-24T10:30:00.000Z"
}
```

### 2. List Organizations

Retrieves a paginated list of organizations with optional filtering.

**Endpoint:** `GET /enterprise/organizations`

**Query Parameters:**

- `status` (optional): Filter by status (ACTIVE, SUSPENDED, INACTIVE, PENDING)
- `subscriptionTier` (optional): Filter by tier (FREE, BASIC, PRO, ENTERPRISE)
- `limit` (optional): Max results (1-100, default: 20)
- `offset` (optional): Skip results (default: 0)

**cURL Example:**

```bash
curl -X GET "${API_URL}/enterprise/organizations?status=ACTIVE&limit=20&offset=0" \
  -H "Authorization: Bearer ${TOKEN}"
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Smile Dental Group",
        "status": "ACTIVE",
        "subscriptionTier": "PRO",
        "maxClinics": 10,
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "count": 1,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  },
  "timestamp": "2025-01-24T10:30:00.000Z"
}
```

### 3. Get Organization by ID

**Endpoint:** `GET /enterprise/organizations/:id`

**cURL Example:**

```bash
ORG_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X GET "${API_URL}/enterprise/organizations/${ORG_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 4. Update Organization

**Endpoint:** `PATCH /enterprise/organizations/:id`

**cURL Example:**

```bash
curl -X PATCH "${API_URL}/enterprise/organizations/${ORG_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "primaryContactName": "Dr. Jane Doe",
    "primaryContactEmail": "jane.doe@smiledental.com",
    "status": "ACTIVE"
  }'
```

### 5. Update Organization Settings

**Endpoint:** `PATCH /enterprise/organizations/:id/settings`

**cURL Example:**

```bash
curl -X PATCH "${API_URL}/enterprise/organizations/${ORG_ID}/settings" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "brandPrimaryColor": "#0066CC",
    "enableMultiClinic": true,
    "enableAdvancedAnalytics": true,
    "requireMFA": true,
    "enableHIPAAMode": true
  }'
```

### 6. Add Organization Administrator

**Endpoint:** `POST /enterprise/organizations/:id/admins`

**cURL Example:**

```bash
curl -X POST "${API_URL}/enterprise/organizations/${ORG_ID}/admins" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "email": "admin@smiledental.com",
    "fullName": "Dr. Sarah Johnson",
    "role": "ORG_ADMIN"
  }'
```

---

## Clinics API

### 1. Create Clinic

Creates a new clinic within an organization.

**Endpoint:** `POST /enterprise/organizations/:orgId/clinics`

**Request Body:**

```json
{
  "name": "Smile Dental - Downtown",
  "code": "SDG-DT-001",
  "address": {
    "street": "123 Main Street",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94102",
    "country": "United States"
  },
  "phone": "+1-415-555-1000",
  "email": "downtown@smiledental.com",
  "website": "https://downtown.smiledental.com",
  "managerUserId": "550e8400-e29b-41d4-a716-446655440001",
  "managerName": "Dr. Emily Rodriguez",
  "managerEmail": "emily.rodriguez@smiledental.com",
  "timezone": "America/Los_Angeles",
  "locale": "en-US",
  "operatingHours": {
    "monday": { "open": "09:00", "close": "17:00" },
    "tuesday": { "open": "09:00", "close": "17:00" },
    "wednesday": { "open": "09:00", "close": "17:00" },
    "thursday": { "open": "09:00", "close": "17:00" },
    "friday": { "open": "09:00", "close": "17:00" }
  },
  "licenseNumber": "DL-CA-123456"
}
```

**cURL Example:**

```bash
curl -X POST "${API_URL}/enterprise/organizations/${ORG_ID}/clinics" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d @- << 'EOF'
{
  "name": "Smile Dental - Downtown",
  "code": "SDG-DT-001",
  "address": {
    "street": "123 Main Street",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94102",
    "country": "United States"
  },
  "phone": "+1-415-555-1000",
  "email": "downtown@smiledental.com",
  "timezone": "America/Los_Angeles",
  "locale": "en-US"
}
EOF
```

### 2. List Clinics for Organization

**Endpoint:** `GET /enterprise/organizations/:orgId/clinics`

**cURL Example:**

```bash
curl -X GET "${API_URL}/enterprise/organizations/${ORG_ID}/clinics" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 3. Get Clinic by ID

**Endpoint:** `GET /enterprise/clinics/:clinicId`

**cURL Example:**

```bash
CLINIC_ID="550e8400-e29b-41d4-a716-446655440002"

curl -X GET "${API_URL}/enterprise/clinics/${CLINIC_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 4. Update Clinic

**Endpoint:** `PATCH /enterprise/clinics/:clinicId`

**cURL Example:**

```bash
curl -X PATCH "${API_URL}/enterprise/clinics/${CLINIC_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smile Dental - Downtown (Renovated)",
    "status": "ACTIVE",
    "phone": "+1-415-555-3000"
  }'
```

### 5. Update Clinic Settings

**Endpoint:** `PATCH /enterprise/clinics/:clinicId/settings`

**cURL Example:**

```bash
curl -X PATCH "${API_URL}/enterprise/clinics/${CLINIC_ID}/settings" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "defaultAppointmentDurationMinutes": 30,
    "allowOnlineBooking": true,
    "requireDepositForBooking": true,
    "depositPercentage": 20,
    "defaultCurrency": "USD",
    "enableInventoryTracking": true
  }'
```

### 6. Create Clinic Location

**Endpoint:** `POST /enterprise/clinics/:clinicId/locations`

**cURL Example:**

```bash
curl -X POST "${API_URL}/enterprise/clinics/${CLINIC_ID}/locations" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "TREATMENT_ROOM",
    "name": "Treatment Room 1",
    "code": "TR-01",
    "floor": 2,
    "area": "West Wing",
    "capacity": 1,
    "notes": "Equipped with digital X-ray"
  }'
```

---

## Provider-Clinic Assignments API

### 1. Assign Provider to Clinic

**Endpoint:** `POST /enterprise/providers/:staffId/assign`

**Request Body:**

```json
{
  "clinicId": "550e8400-e29b-41d4-a716-446655440002",
  "roles": ["DENTIST"],
  "isPrimaryClinic": true,
  "workingHoursOverride": {
    "monday": { "start": "08:00", "end": "17:00" },
    "tuesday": { "start": "08:00", "end": "17:00" },
    "wednesday": { "start": "08:00", "end": "17:00" },
    "thursday": { "start": "08:00", "end": "17:00" },
    "friday": { "start": "08:00", "end": "14:00" }
  }
}
```

**cURL Example:**

```bash
STAFF_ID="550e8400-e29b-41d4-a716-446655440003"

curl -X POST "${API_URL}/enterprise/providers/${STAFF_ID}/assign" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "X-Organization-ID: ${ORG_ID}" \
  -d '{
    "clinicId": "'"${CLINIC_ID}"'",
    "roles": ["DENTIST"],
    "isPrimaryClinic": true
  }'
```

### 2. List Provider Clinics

**Endpoint:** `GET /enterprise/providers/:staffId/clinics`

**cURL Example:**

```bash
curl -X GET "${API_URL}/enterprise/providers/${STAFF_ID}/clinics" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 3. List Clinic Staff

**Endpoint:** `GET /enterprise/clinics/:clinicId/staff`

**cURL Example:**

```bash
curl -X GET "${API_URL}/enterprise/clinics/${CLINIC_ID}/staff" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## RBAC API

### 1. Create Custom Role

**Endpoint:** `POST /enterprise/rbac/roles`

**Request Body:**

```json
{
  "code": "REGIONAL_MANAGER",
  "name": "Regional Manager",
  "description": "Manages clinics within a specific geographic region",
  "permissions": [
    "VIEW_ALL_CLINICS",
    "MANAGE_CLINIC_STAFF",
    "VIEW_REPORTS",
    "MANAGE_SCHEDULES"
  ],
  "level": "ORGANIZATION"
}
```

**cURL Example:**

```bash
curl -X POST "${API_URL}/enterprise/rbac/roles" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "REGIONAL_MANAGER",
    "name": "Regional Manager",
    "description": "Manages multiple clinics in a region",
    "permissions": ["VIEW_ALL_CLINICS", "MANAGE_CLINIC_STAFF"],
    "level": "ORGANIZATION"
  }'
```

### 2. Get All Permissions

**Endpoint:** `GET /enterprise/rbac/permissions`

**cURL Example:**

```bash
curl -X GET "${API_URL}/enterprise/rbac/permissions" \
  -H "Authorization: Bearer ${TOKEN}"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "enterpriseRoles": [
      "ORG_ADMIN",
      "ORG_MANAGER",
      "MULTI_CLINIC_MANAGER",
      "AUDITOR",
      "SYSTEM_OWNER"
    ],
    "clinicRoles": [
      "CLINIC_MANAGER",
      "CLINIC_OWNER",
      "CLINIC_FINANCE",
      "CLINIC_STAFF_ADMIN"
    ]
  },
  "timestamp": "2025-01-24T10:30:00.000Z"
}
```

---

## Error Handling

All error responses follow a standardized format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "name must be a string",
    "email must be a valid email address"
  ],
  "path": "/api/v1/enterprise/organizations",
  "timestamp": "2025-01-24T10:30:00.000Z",
  "correlationId": "abc123-def456-ghi789"
}
```

### Common HTTP Status Codes

- **200 OK**: Request succeeded
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data or validation error
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict (duplicate, constraint violation)
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Error Examples

**Validation Error (400):**

```bash
curl -X POST "${API_URL}/enterprise/organizations" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "email": "invalid-email"
  }'

# Response:
# {
#   "statusCode": 400,
#   "message": "Validation failed",
#   "errors": [
#     "name should not be empty",
#     "email must be a valid email"
#   ]
# }
```

**Unauthorized (401):**

```bash
curl -X GET "${API_URL}/enterprise/organizations" \
  -H "Content-Type: application/json"

# Response:
# {
#   "statusCode": 401,
#   "message": "Unauthorized"
# }
```

**Not Found (404):**

```bash
curl -X GET "${API_URL}/enterprise/organizations/invalid-id" \
  -H "Authorization: Bearer ${TOKEN}"

# Response:
# {
#   "statusCode": 404,
#   "message": "Organization not found"
# }
```

---

## Rate Limiting

API requests are rate-limited based on subscription tier:

| Tier       | Requests per Minute |
|------------|---------------------|
| FREE       | 100                 |
| BASIC      | 500                 |
| PRO        | 2,000               |
| ENTERPRISE | 10,000              |

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 2000
X-RateLimit-Remaining: 1999
X-RateLimit-Reset: 1611500400
```

When rate limit is exceeded:

```json
{
  "statusCode": 429,
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

---

## Complete Workflow Example

Here's a complete workflow for setting up a multi-clinic organization:

```bash
#!/bin/bash

# 1. Set environment variables
export TOKEN="your_jwt_token"
export API_URL="http://localhost:3002/api/v1"

# 2. Create organization
ORG_RESPONSE=$(curl -s -X POST "${API_URL}/enterprise/organizations" \
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
  }')

ORG_ID=$(echo $ORG_RESPONSE | jq -r '.data.id')
echo "Created organization: $ORG_ID"

# 3. Create clinic
CLINIC_RESPONSE=$(curl -s -X POST "${API_URL}/enterprise/organizations/${ORG_ID}/clinics" \
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
  }')

CLINIC_ID=$(echo $CLINIC_RESPONSE | jq -r '.data.id')
echo "Created clinic: $CLINIC_ID"

# 4. Assign provider to clinic
curl -s -X POST "${API_URL}/enterprise/providers/${STAFF_ID}/assign" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "X-Organization-ID: ${ORG_ID}" \
  -d '{
    "clinicId": "'"${CLINIC_ID}"'",
    "roles": ["DENTIST"],
    "isPrimaryClinic": true
  }' | jq '.'

echo "Workflow complete!"
```

---

## Additional Resources

- **Swagger UI**: `http://localhost:3002/api-docs`
- **OpenAPI Spec**: `http://localhost:3002/api-docs-json`
- **Support**: support@dentalos.com
- **Documentation**: https://docs.dentalos.com
