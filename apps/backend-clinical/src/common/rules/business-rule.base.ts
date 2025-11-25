/**
 * Business Rule Base Classes
 *
 * Provides base implementations for business rules in the Enterprise Service.
 *
 * Patterns:
 * - Template method pattern
 * - Specification pattern
 * - Composite pattern
 *
 * Edge cases handled:
 * - Async rule evaluation
 * - Rule composition
 * - Error handling
 * - Rule priorities
 *
 * @module BusinessRuleBase
 */

import { Logger } from '@nestjs/common';
import {
  type IBusinessRule,
  type ICompositeBusinessRule,
  type IBusinessRuleValidator,
  type BusinessRuleResult,
  type BusinessRuleValidationResult,
} from './business-rule.interface';

/**
 * Abstract base class for business rules
 *
 * Implements common functionality for all business rules
 */
export abstract class BusinessRuleBase<T> implements IBusinessRule<T> {
  protected readonly logger: Logger;

  constructor(
    protected readonly ruleName: string,
    protected readonly priority: number = 0,
  ) {
    this.logger = new Logger(`BusinessRule:${ruleName}`);
  }

  /**
   * Template method for rule evaluation
   *
   * Edge cases:
   * - Logs evaluation
   * - Handles errors gracefully
   * - Returns structured result
   *
   * @param entity - Entity to evaluate
   * @returns Rule result
   */
  async evaluate(entity: T): Promise<BusinessRuleResult> {
    try {
      this.logger.debug(`Evaluating rule: ${this.ruleName}`);

      const result = await this.evaluateRule(entity);

      if (!result.isValid) {
        this.logger.warn(`Rule failed: ${this.ruleName}`, {
          errorMessage: result.errorMessage,
          errorCode: result.errorCode,
        });
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Error evaluating rule: ${this.ruleName}`,
        error instanceof Error ? error.stack : undefined,
      );

      return {
        isValid: false,
        errorMessage: `Rule evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
        errorCode: 'RULE_EVALUATION_ERROR',
        context: {
          ruleName: this.ruleName,
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Abstract method to be implemented by concrete rules
   *
   * @param entity - Entity to evaluate
   * @returns Rule result
   */
  protected abstract evaluateRule(entity: T): Promise<BusinessRuleResult> | BusinessRuleResult;

  getRuleName(): string {
    return this.ruleName;
  }

  getPriority(): number {
    return this.priority;
  }

  /**
   * Helper to create successful result
   */
  protected success(): BusinessRuleResult {
    return { isValid: true };
  }

  /**
   * Helper to create failed result
   *
   * @param errorMessage - Error message
   * @param errorCode - Error code (optional)
   * @param context - Additional context (optional)
   */
  protected fail(
    errorMessage: string,
    errorCode?: string,
    context?: Record<string, unknown>,
  ): BusinessRuleResult {
    return {
      isValid: false,
      errorMessage,
      errorCode,
      context,
    };
  }
}

/**
 * AND composite rule
 *
 * All rules must pass for the composite to pass
 */
export class AndBusinessRule<T> implements ICompositeBusinessRule<T> {
  private readonly logger = new Logger('AndBusinessRule');
  private rules: IBusinessRule<T>[] = [];

  constructor(
    private readonly compositeRuleName: string,
    rules: IBusinessRule<T>[] = [],
  ) {
    this.rules = rules;
  }

  async evaluate(entity: T): Promise<BusinessRuleResult> {
    this.logger.debug(`Evaluating AND composite: ${this.compositeRuleName}`);

    const failures: string[] = [];
    const contexts: Record<string, unknown>[] = [];

    // Evaluate all rules
    for (const rule of this.rules) {
      const result = await rule.evaluate(entity);

      if (!result.isValid) {
        failures.push(result.errorMessage || 'Unknown error');
        if (result.context) {
          contexts.push(result.context);
        }
      }
    }

    // Edge case: All rules must pass
    if (failures.length > 0) {
      return {
        isValid: false,
        errorMessage: `Composite rule failed: ${failures.join('; ')}`,
        errorCode: 'AND_COMPOSITE_FAILED',
        context: {
          failures: failures.length,
          contexts,
        },
      };
    }

    return { isValid: true };
  }

  getRuleName(): string {
    return this.compositeRuleName;
  }

  addRule(rule: IBusinessRule<T>): void {
    this.rules.push(rule);
  }

  removeRule(rule: IBusinessRule<T>): void {
    const index = this.rules.indexOf(rule);
    if (index !== -1) {
      this.rules.splice(index, 1);
    }
  }

  getRules(): IBusinessRule<T>[] {
    return [...this.rules];
  }
}

/**
 * OR composite rule
 *
 * At least one rule must pass for the composite to pass
 */
export class OrBusinessRule<T> implements ICompositeBusinessRule<T> {
  private readonly logger = new Logger('OrBusinessRule');
  private rules: IBusinessRule<T>[] = [];

  constructor(
    private readonly compositeRuleName: string,
    rules: IBusinessRule<T>[] = [],
  ) {
    this.rules = rules;
  }

  async evaluate(entity: T): Promise<BusinessRuleResult> {
    this.logger.debug(`Evaluating OR composite: ${this.compositeRuleName}`);

    const failures: string[] = [];

    // Evaluate all rules
    for (const rule of this.rules) {
      const result = await rule.evaluate(entity);

      // Edge case: At least one rule must pass
      if (result.isValid) {
        return { isValid: true };
      }

      failures.push(result.errorMessage || 'Unknown error');
    }

    // All rules failed
    return {
      isValid: false,
      errorMessage: `All rules in OR composite failed: ${failures.join('; ')}`,
      errorCode: 'OR_COMPOSITE_FAILED',
      context: {
        failures: failures.length,
      },
    };
  }

  getRuleName(): string {
    return this.compositeRuleName;
  }

  addRule(rule: IBusinessRule<T>): void {
    this.rules.push(rule);
  }

  removeRule(rule: IBusinessRule<T>): void {
    const index = this.rules.indexOf(rule);
    if (index !== -1) {
      this.rules.splice(index, 1);
    }
  }

  getRules(): IBusinessRule<T>[] {
    return [...this.rules];
  }
}

/**
 * NOT rule
 *
 * Inverts the result of a rule
 */
export class NotBusinessRule<T> implements IBusinessRule<T> {
  private readonly logger = new Logger('NotBusinessRule');

  constructor(
    private readonly rule: IBusinessRule<T>,
    private readonly notRuleName?: string,
  ) {}

  async evaluate(entity: T): Promise<BusinessRuleResult> {
    this.logger.debug(`Evaluating NOT rule: ${this.getRuleName()}`);

    const result = await this.rule.evaluate(entity);

    // Invert the result
    if (result.isValid) {
      return {
        isValid: false,
        errorMessage: `NOT rule failed: ${this.rule.getRuleName()} passed but should have failed`,
        errorCode: 'NOT_RULE_FAILED',
      };
    }

    return { isValid: true };
  }

  getRuleName(): string {
    return this.notRuleName || `NOT(${this.rule.getRuleName()})`;
  }
}

/**
 * Business rule validator
 *
 * Validates entities against a collection of business rules
 */
export class BusinessRuleValidator<T> implements IBusinessRuleValidator<T> {
  private readonly logger = new Logger('BusinessRuleValidator');
  private rules: IBusinessRule<T>[] = [];

  constructor(rules: IBusinessRule<T>[] = []) {
    this.rules = rules;
  }

  /**
   * Validates entity against all rules
   *
   * Edge cases:
   * - Sorts rules by priority (higher priority first)
   * - Evaluates all rules (doesn't short-circuit)
   * - Collects all failures
   * - Returns structured result
   *
   * @param entity - Entity to validate
   * @returns Validation result
   */
  async validate(entity: T): Promise<BusinessRuleValidationResult> {
    this.logger.debug('Starting business rule validation');

    // Sort rules by priority (higher priority first)
    const sortedRules = [...this.rules].sort((a, b) => {
      const priorityA = a.getPriority?.() ?? 0;
      const priorityB = b.getPriority?.() ?? 0;
      return priorityB - priorityA;
    });

    const failures: BusinessRuleValidationResult['failures'] = [];
    let passed = 0;
    let failed = 0;

    // Evaluate all rules
    for (const rule of sortedRules) {
      const result = await rule.evaluate(entity);

      if (result.isValid) {
        passed++;
      } else {
        failed++;
        failures.push({
          ruleName: rule.getRuleName(),
          errorMessage: result.errorMessage || 'Unknown error',
          errorCode: result.errorCode,
          context: result.context,
        });
      }
    }

    const validationResult: BusinessRuleValidationResult = {
      isValid: failures.length === 0,
      failures,
      rulesEvaluated: sortedRules.length,
      rulesPassed: passed,
      rulesFailed: failed,
    };

    if (!validationResult.isValid) {
      this.logger.warn('Business rule validation failed', {
        failures: failures.length,
        rulesEvaluated: sortedRules.length,
      });
    }

    return validationResult;
  }

  addRule(rule: IBusinessRule<T>): void {
    this.rules.push(rule);
  }

  removeRule(rule: IBusinessRule<T>): void {
    const index = this.rules.indexOf(rule);
    if (index !== -1) {
      this.rules.splice(index, 1);
    }
  }

  getRules(): IBusinessRule<T>[] {
    return [...this.rules];
  }
}
