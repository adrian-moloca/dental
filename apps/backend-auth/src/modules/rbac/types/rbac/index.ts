/**
 * RBAC Type Definitions - Centralized Export
 *
 * Centralized type definitions for Role-Based Access Control system.
 * These types ensure type safety across the entire RBAC implementation.
 *
 * ORGANIZATION:
 * - core.types.ts: Base types, user context, role definitions
 * - permission.types.ts: Permission checks, validation, metadata
 * - assignment.types.ts: User-role assignments, role management DTOs
 * - entity.types.ts: Database entity representations, audit logs
 */

// Re-export all types from modular files
export * from './core.types';
export * from './permission.types';
export * from './assignment.types';
export * from './entity.types';
