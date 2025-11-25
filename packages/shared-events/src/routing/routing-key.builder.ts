/**
 * Routing Key Builder
 *
 * Utilities for building and parsing routing keys for event-driven messaging.
 * Routing keys follow the pattern: domain.entity.action
 *
 * Examples:
 * - dental.patient.created
 * - dental.appointment.booked
 * - dental.user.updated
 *
 * @module shared-events/routing
 */

/**
 * Components of a routing key
 */
export interface RoutingKeyComponents {
  /**
   * Domain/bounded context (e.g., 'dental', 'billing')
   */
  readonly domain: string;

  /**
   * Entity/aggregate type (e.g., 'patient', 'appointment')
   */
  readonly entity: string;

  /**
   * Action/event type (e.g., 'created', 'updated', 'deleted')
   */
  readonly action: string;
}

/**
 * Builds a routing key from domain, entity, and action components
 *
 * Format: {domain}.{entity}.{action}
 *
 * @param domain - The domain or bounded context
 * @param entity - The entity or aggregate type
 * @param action - The action or event type
 * @returns A dot-separated routing key
 * @throws {Error} If any component is empty or contains dots
 *
 * @example
 * ```typescript
 * const key = buildRoutingKey('dental', 'patient', 'created');
 * // Returns: 'dental.patient.created'
 * ```
 *
 * Edge cases handled:
 * - Empty strings (throws error)
 * - Whitespace (trimmed)
 * - Dots in components (throws error - would break routing)
 * - Special characters (allowed but not recommended)
 */
export function buildRoutingKey(
  domain: string,
  entity: string,
  action: string
): string {
  // Validate and sanitize inputs
  const trimmedDomain = validateAndTrimComponent(domain, 'domain');
  const trimmedEntity = validateAndTrimComponent(entity, 'entity');
  const trimmedAction = validateAndTrimComponent(action, 'action');

  // Build routing key
  return `${trimmedDomain}.${trimmedEntity}.${trimmedAction}`;
}

/**
 * Parses a routing key into its component parts
 *
 * @param routingKey - The routing key to parse
 * @returns The routing key components
 * @throws {Error} If routing key format is invalid
 *
 * @example
 * ```typescript
 * const components = parseRoutingKey('dental.patient.created');
 * // Returns: { domain: 'dental', entity: 'patient', action: 'created' }
 * ```
 *
 * Edge cases handled:
 * - Invalid format (not exactly 3 parts separated by dots)
 * - Empty routing key (throws error)
 * - Extra dots (throws error)
 * - Missing parts (throws error)
 */
export function parseRoutingKey(routingKey: string): RoutingKeyComponents {
  if (!routingKey || typeof routingKey !== 'string') {
    throw new Error('Routing key must be a non-empty string');
  }

  const trimmed = routingKey.trim();
  if (trimmed.length === 0) {
    throw new Error('Routing key cannot be empty or whitespace');
  }

  const parts = trimmed.split('.');

  if (parts.length !== 3) {
    throw new Error(
      `Invalid routing key format: expected 'domain.entity.action', got '${routingKey}'`
    );
  }

  const [domain, entity, action] = parts;

  // Validate each part
  if (!domain || domain.trim().length === 0) {
    throw new Error('Routing key domain cannot be empty');
  }

  if (!entity || entity.trim().length === 0) {
    throw new Error('Routing key entity cannot be empty');
  }

  if (!action || action.trim().length === 0) {
    throw new Error('Routing key action cannot be empty');
  }

  return {
    domain: domain.trim(),
    entity: entity.trim(),
    action: action.trim(),
  };
}

/**
 * Validates and trims a routing key component
 *
 * @param component - The component to validate
 * @param name - The name of the component (for error messages)
 * @returns The trimmed component
 * @throws {Error} If component is invalid
 * @private
 */
function validateAndTrimComponent(component: string, name: string): string {
  if (!component || typeof component !== 'string') {
    throw new Error(`Routing key ${name} must be a non-empty string`);
  }

  const trimmed = component.trim();

  if (trimmed.length === 0) {
    throw new Error(`Routing key ${name} cannot be empty or whitespace`);
  }

  if (trimmed.includes('.')) {
    throw new Error(
      `Routing key ${name} cannot contain dots: '${component}'`
    );
  }

  return trimmed;
}

/**
 * Checks if a routing key matches a pattern
 *
 * Supports wildcards:
 * - * matches exactly one word
 * - # matches zero or more words
 *
 * @param routingKey - The routing key to check
 * @param pattern - The pattern to match against
 * @returns true if the routing key matches the pattern
 *
 * @example
 * ```typescript
 * matchesPattern('dental.patient.created', 'dental.*.created'); // true
 * matchesPattern('dental.patient.created', 'dental.#'); // true
 * matchesPattern('dental.patient.updated', 'dental.*.created'); // false
 * ```
 */
export function matchesPattern(routingKey: string, pattern: string): boolean {
  const keyParts = routingKey.split('.');
  const patternParts = pattern.split('.');

  let keyIndex = 0;
  let patternIndex = 0;

  while (patternIndex < patternParts.length) {
    const patternPart = patternParts[patternIndex];

    if (patternPart === '#') {
      // Hash matches zero or more words
      if (patternIndex === patternParts.length - 1) {
        // Last pattern part, matches rest of key
        return true;
      }

      // Look ahead to next pattern part
      const nextPattern = patternParts[patternIndex + 1];
      while (keyIndex < keyParts.length) {
        if (keyParts[keyIndex] === nextPattern) {
          patternIndex++;
          keyIndex++;
          break;
        }
        keyIndex++;
      }
    } else if (patternPart === '*') {
      // Star matches exactly one word
      if (keyIndex >= keyParts.length) {
        return false;
      }
      keyIndex++;
      patternIndex++;
    } else {
      // Exact match required
      if (keyIndex >= keyParts.length || keyParts[keyIndex] !== patternPart) {
        return false;
      }
      keyIndex++;
      patternIndex++;
    }
  }

  // Both should be fully consumed
  return keyIndex === keyParts.length && patternIndex === patternParts.length;
}
