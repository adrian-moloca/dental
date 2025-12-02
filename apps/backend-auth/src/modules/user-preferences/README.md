# User Preferences Module

## Overview

The User Preferences module provides a REST API for storing and retrieving user-specific settings such as dashboard layout configurations and theme preferences. It implements an auto-create pattern with sensible defaults for first-time users and an upsert pattern for seamless updates.

## Features

- **Dashboard Layout Management**: Store grid-based layout configurations with position (x, y) and dimensions (w, h)
- **Theme Preferences**: Extensible theme settings for future UI customization
- **Auto-Create Defaults**: First access automatically creates default preferences
- **Upsert Pattern**: Update endpoint creates if not exists, updates if exists
- **Multi-Tenant Isolation**: All operations enforce organizationId filtering
- **JWT Authentication**: User identification from access token

## Architecture

### Database Schema

**Table**: `user_preferences`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users table |
| organization_id | UUID | Tenant isolation |
| dashboard_layout | JSONB | Array of section configs |
| theme_preferences | JSONB | Optional theme settings |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Indexes**:
- Unique index on (user_id, organization_id)
- Index on organization_id

**Foreign Keys**:
- user_id → users(id) ON DELETE CASCADE
- organization_id → organizations(id) ON DELETE CASCADE

### Dashboard Layout Structure

```typescript
interface DashboardSection {
  id: string;        // Section identifier (e.g., 'appointments-calendar')
  x: number;         // X-coordinate in grid
  y: number;         // Y-coordinate in grid
  w: number;         // Width in grid units
  h: number;         // Height in grid units
  visible: boolean;  // Whether section is visible
}
```

### Default Dashboard Layout

On first access, the following default layout is created:

```json
[
  {
    "id": "appointments-calendar",
    "x": 0,
    "y": 0,
    "w": 8,
    "h": 4,
    "visible": true
  },
  {
    "id": "recent-patients",
    "x": 8,
    "y": 0,
    "w": 4,
    "h": 4,
    "visible": true
  },
  {
    "id": "daily-statistics",
    "x": 0,
    "y": 4,
    "w": 6,
    "h": 3,
    "visible": true
  },
  {
    "id": "pending-tasks",
    "x": 6,
    "y": 4,
    "w": 6,
    "h": 3,
    "visible": true
  }
]
```

## API Endpoints

### GET /users/me/preferences

Retrieve preferences for the authenticated user.

**Authentication**: Required (JWT)

**Request**: None

**Response**: 200 OK
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "123e4567-e89b-12d3-a456-426614174001",
  "organizationId": "123e4567-e89b-12d3-a456-426614174002",
  "dashboardLayout": [
    {
      "id": "appointments-calendar",
      "x": 0,
      "y": 0,
      "w": 8,
      "h": 4,
      "visible": true
    }
  ],
  "themePreferences": null,
  "createdAt": "2024-11-28T10:00:00.000Z",
  "updatedAt": "2024-11-28T10:00:00.000Z"
}
```

**Behavior**:
- If preferences don't exist, creates default preferences and returns them
- Auto-creation ensures users always have preferences

**Error Responses**:
- 401 Unauthorized: Missing or invalid JWT token
- 404 Not Found: User not found in organization

---

### PATCH /users/me/preferences

Update preferences for the authenticated user.

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "dashboardLayout": [
    {
      "id": "appointments-calendar",
      "x": 0,
      "y": 0,
      "w": 12,
      "h": 6,
      "visible": true
    },
    {
      "id": "recent-patients",
      "x": 0,
      "y": 6,
      "w": 6,
      "h": 4,
      "visible": true
    }
  ],
  "themePreferences": {
    "mode": "dark",
    "primaryColor": "#1976d2",
    "fontSize": "medium",
    "highContrast": false
  }
}
```

**Response**: 200 OK
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "123e4567-e89b-12d3-a456-426614174001",
  "organizationId": "123e4567-e89b-12d3-a456-426614174002",
  "dashboardLayout": [...],
  "themePreferences": {...},
  "createdAt": "2024-11-28T10:00:00.000Z",
  "updatedAt": "2024-11-28T11:30:00.000Z"
}
```

**Behavior**:
- Uses upsert pattern: creates if not exists, updates if exists
- All fields are optional - only provided fields are updated
- Partial updates supported

**Error Responses**:
- 400 Bad Request: Invalid input data (validation failed)
- 401 Unauthorized: Missing or invalid JWT token
- 404 Not Found: User not found in organization

## Usage Examples

### Frontend Integration (React/TypeScript)

```typescript
// Get preferences
const getPreferences = async () => {
  const response = await fetch('/api/users/me/preferences', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (response.ok) {
    const preferences = await response.json();
    return preferences.dashboardLayout;
  }
};

// Update dashboard layout
const updateDashboardLayout = async (newLayout: DashboardSection[]) => {
  const response = await fetch('/api/users/me/preferences', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dashboardLayout: newLayout,
    }),
  });

  if (response.ok) {
    const updated = await response.json();
    console.log('Preferences updated:', updated);
  }
};

// Example: Save grid layout from react-grid-layout
const handleLayoutChange = (layout: Layout[]) => {
  const dashboardLayout = layout.map(item => ({
    id: item.i,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    visible: true,
  }));

  updateDashboardLayout(dashboardLayout);
};
```

## Security

### Multi-Tenant Isolation

All database queries enforce `organizationId` filtering:

```typescript
// ✅ CORRECT: Always filter by organizationId
await repository.findOne({
  where: {
    userId,
    organizationId,  // Required for tenant isolation
  },
});

// ❌ INCORRECT: Missing organizationId allows cross-tenant access
await repository.findOne({
  where: { userId },
});
```

### User Identification

- User ID extracted from JWT token (`user.sub`)
- Users can only access/modify their own preferences
- No userId in request body (prevents privilege escalation)

### Rate Limiting

- GET: 200 requests per minute
- PATCH: 100 requests per minute

## Migration

Run database migration to create the `user_preferences` table:

```bash
# Development
npm run migration:run

# Production
npm run migration:run:prod
```

Migration file: `src/database/migrations/1732800000000-CreateUserPreferencesTable.ts`

## Testing

### Unit Tests (TODO)

```typescript
describe('UserPreferencesService', () => {
  it('should create default preferences on first access', async () => {
    const preferences = await service.getPreferences(userId, organizationId);
    expect(preferences.dashboardLayout).toHaveLength(4);
  });

  it('should update existing preferences', async () => {
    const updated = await service.updatePreferences(userId, organizationId, {
      dashboardLayout: [{ id: 'test', x: 0, y: 0, w: 12, h: 6, visible: true }],
    });
    expect(updated.dashboardLayout).toHaveLength(1);
  });

  it('should enforce tenant isolation', async () => {
    await expect(
      service.getPreferences(userId, otherOrganizationId)
    ).rejects.toThrow(NotFoundException);
  });
});
```

### Integration Tests (TODO)

```typescript
describe('GET /users/me/preferences', () => {
  it('should return preferences for authenticated user', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/me/preferences')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('dashboardLayout');
  });

  it('should return 401 for unauthenticated request', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/me/preferences');

    expect(response.status).toBe(401);
  });
});
```

## Performance

### Expected Performance

- GET /users/me/preferences: < 100ms (simple indexed query)
- PATCH /users/me/preferences: < 100ms (upsert with indexes)

### Database Indexes

- `idx_user_preferences_user_org_unique`: Unique index on (user_id, organization_id)
  - Supports fast lookups by userId + organizationId
  - Enforces one record per user per organization
- `idx_user_preferences_org`: Index on organization_id
  - Supports tenant-scoped queries
  - Foreign key performance

### Caching Considerations

Current implementation does not use caching. Future optimization could add:

```typescript
// Redis cache with TTL
const cacheKey = `preferences:${userId}:${organizationId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// On update, invalidate cache
await redis.del(cacheKey);
```

## Future Enhancements

1. **Theme Preferences**: Implement full theme customization
   - Color schemes
   - Font preferences
   - Accessibility settings

2. **Notification Preferences**: Email, SMS, push notification settings

3. **Language Preferences**: i18n locale selection

4. **Default View Preferences**: Default page on login

5. **Export/Import**: Allow users to export/import their preferences

6. **Organization-Wide Defaults**: Allow admins to set default preferences for new users

## Related Modules

- **UsersModule**: User entity and repository
- **RBACModule**: Authentication decorators
- **AuthModule**: JWT authentication

## File Structure

```
user-preferences/
├── README.md
├── user-preferences.module.ts
├── controllers/
│   └── user-preferences.controller.ts
├── services/
│   └── user-preferences.service.ts
├── repositories/
│   └── user-preference.repository.ts
├── entities/
│   └── user-preference.entity.ts
└── dto/
    ├── index.ts
    ├── update-preferences.dto.ts
    └── user-preference-response.dto.ts
```

## Support

For issues or questions, contact the backend team or open an issue in the project repository.
