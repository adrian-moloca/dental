/**
 * Business Rule Interfaces
 *
 * Defines interfaces for implementing business rules in the Enterprise Service.
 *
 * Patterns:
 * - Specification pattern
 * - Chain of responsibility
 * - Strategy pattern
 *
 * Edge cases handled:
 * - Rule dependencies
 * - Rule composition (AND, OR, NOT)
 * - Async rule evaluation
 * - Rule priorities
 *
 * @module BusinessRuleInterface
 */

/**
 * Business rule result
 */
export interface BusinessRuleResult {
  /**
   * Whether the rule passed
   */
  isValid: boolean;

  /**
   * Error message if rule failed
   */
  errorMessage?: string;

  /**
   * Error code for programmatic handling
   */
  errorCode?: string;

  /**
   * Additional context about the failure
   */
  context?: Record<string, unknown>;
}

/**
 * Business rule interface
 *
 * Implements the Specification pattern for business rules
 */
export interface IBusinessRule<T> {
  /**
   * Evaluates the business rule
   *
   * @param entity - Entity to evaluate
   * @returns Rule result
   */
  evaluate(entity: T): Promise<BusinessRuleResult> | BusinessRuleResult;

  /**
   * Gets rule name for logging and debugging
   */
  getRuleName(): string;

  /**
   * Gets rule priority (higher = executed first)
   * Default: 0
   */
  getPriority?(): number;
}

/**
 * Composite business rule
 *
 * Allows combining multiple rules with AND/OR logic
 */
export interface ICompositeBusinessRule<T> extends IBusinessRule<T> {
  /**
   * Adds a rule to the composite
   *
   * @param rule - Rule to add
   */
  addRule(rule: IBusinessRule<T>): void;

  /**
   * Removes a rule from the composite
   *
   * @param rule - Rule to remove
   */
  removeRule(rule: IBusinessRule<T>): void;

  /**
   * Gets all rules in the composite
   */
  getRules(): IBusinessRule<T>[];
}

/**
 * Business rule validator
 *
 * Validates entities against a set of business rules
 */
export interface IBusinessRuleValidator<T> {
  /**
   * Validates entity against all rules
   *
   * @param entity - Entity to validate
   * @returns Validation result with all rule failures
   */
  validate(entity: T): Promise<BusinessRuleValidationResult>;

  /**
   * Adds a rule to the validator
   *
   * @param rule - Rule to add
   */
  addRule(rule: IBusinessRule<T>): void;

  /**
   * Removes a rule from the validator
   *
   * @param rule - Rule to remove
   */
  removeRule(rule: IBusinessRule<T>): void;

  /**
   * Gets all rules in the validator
   */
  getRules(): IBusinessRule<T>[];
}

/**
 * Business rule validation result
 */
export interface BusinessRuleValidationResult {
  /**
   * Whether all rules passed
   */
  isValid: boolean;

  /**
   * Array of failed rules
   */
  failures: Array<{
    ruleName: string;
    errorMessage: string;
    errorCode?: string;
    context?: Record<string, unknown>;
  }>;

  /**
   * Number of rules evaluated
   */
  rulesEvaluated: number;

  /**
   * Number of rules that passed
   */
  rulesPassed: number;

  /**
   * Number of rules that failed
   */
  rulesFailed: number;
}
