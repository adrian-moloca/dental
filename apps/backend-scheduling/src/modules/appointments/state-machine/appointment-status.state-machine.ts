/**
 * Appointment Status State Machine
 *
 * Implements a finite state machine for appointment status transitions.
 * This ensures that appointments can only transition through valid states
 * and provides clear error messages for invalid transitions.
 *
 * State Flow:
 * scheduled -> confirmed -> checked_in -> in_progress -> completed
 *     |           |            |              |
 *     v           v            v              v
 * cancelled   cancelled     no_show      cancelled (rare)
 *
 * @module appointments/state-machine
 */

import { AppointmentStatus } from '../entities/appointment.schema';

/**
 * Represents a status transition action
 */
export type TransitionAction =
  | 'confirm'
  | 'check_in'
  | 'start'
  | 'complete'
  | 'cancel'
  | 'no_show'
  | 'reschedule';

/**
 * Configuration for a status transition
 */
export interface TransitionConfig {
  /** The target status after the transition */
  targetStatus: AppointmentStatus;
  /** Human-readable description of the transition */
  description: string;
  /** Whether this transition requires a reason */
  requiresReason?: boolean;
  /** Whether this transition is a terminal state */
  isTerminal?: boolean;
}

/**
 * Transition validation result
 */
export interface TransitionValidationResult {
  /** Whether the transition is valid */
  isValid: boolean;
  /** Error message if invalid */
  errorMessage?: string;
  /** The target status if valid */
  targetStatus?: AppointmentStatus;
}

/**
 * Defines the valid transitions from each appointment status
 *
 * This is the single source of truth for the appointment state machine.
 * Each status maps to the actions that can be performed from that state.
 */
const TRANSITION_MAP: Record<
  AppointmentStatus,
  Partial<Record<TransitionAction, TransitionConfig>>
> = {
  [AppointmentStatus.SCHEDULED]: {
    confirm: {
      targetStatus: AppointmentStatus.CONFIRMED,
      description: 'Confirm the appointment',
    },
    check_in: {
      targetStatus: AppointmentStatus.CHECKED_IN,
      description: 'Check in patient (skips confirmation)',
    },
    cancel: {
      targetStatus: AppointmentStatus.CANCELLED,
      description: 'Cancel the appointment',
      requiresReason: true,
      isTerminal: true,
    },
    reschedule: {
      targetStatus: AppointmentStatus.SCHEDULED,
      description: 'Reschedule to a new time',
    },
  },

  [AppointmentStatus.CONFIRMED]: {
    check_in: {
      targetStatus: AppointmentStatus.CHECKED_IN,
      description: 'Check in patient for appointment',
    },
    cancel: {
      targetStatus: AppointmentStatus.CANCELLED,
      description: 'Cancel the confirmed appointment',
      requiresReason: true,
      isTerminal: true,
    },
    reschedule: {
      targetStatus: AppointmentStatus.SCHEDULED,
      description: 'Reschedule to a new time (resets to scheduled)',
    },
  },

  [AppointmentStatus.CHECKED_IN]: {
    start: {
      targetStatus: AppointmentStatus.IN_PROGRESS,
      description: 'Start the appointment (patient called to treatment room)',
    },
    no_show: {
      targetStatus: AppointmentStatus.NO_SHOW,
      description: 'Mark as no-show (patient left before being seen)',
      isTerminal: true,
    },
    cancel: {
      targetStatus: AppointmentStatus.CANCELLED,
      description: 'Cancel after check-in',
      requiresReason: true,
      isTerminal: true,
    },
  },

  [AppointmentStatus.IN_PROGRESS]: {
    complete: {
      targetStatus: AppointmentStatus.COMPLETED,
      description: 'Complete the appointment',
      isTerminal: true,
    },
    cancel: {
      targetStatus: AppointmentStatus.CANCELLED,
      description: 'Cancel in-progress appointment (rare, emergency situations)',
      requiresReason: true,
      isTerminal: true,
    },
  },

  [AppointmentStatus.COMPLETED]: {
    // Terminal state - no transitions allowed
  },

  [AppointmentStatus.CANCELLED]: {
    // Terminal state - no transitions allowed
  },

  [AppointmentStatus.NO_SHOW]: {
    // Terminal state - no transitions allowed
  },
};

/**
 * Human-readable status names for error messages
 */
const STATUS_DISPLAY_NAMES: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: 'Scheduled',
  [AppointmentStatus.CONFIRMED]: 'Confirmed',
  [AppointmentStatus.CHECKED_IN]: 'Checked In',
  [AppointmentStatus.IN_PROGRESS]: 'In Progress',
  [AppointmentStatus.COMPLETED]: 'Completed',
  [AppointmentStatus.CANCELLED]: 'Cancelled',
  [AppointmentStatus.NO_SHOW]: 'No-Show',
};

/**
 * Human-readable action names for error messages
 */
const ACTION_DISPLAY_NAMES: Record<TransitionAction, string> = {
  confirm: 'confirm',
  check_in: 'check in',
  start: 'start',
  complete: 'complete',
  cancel: 'cancel',
  no_show: 'mark as no-show',
  reschedule: 'reschedule',
};

/**
 * Appointment Status State Machine
 *
 * Validates and executes status transitions for appointments.
 * This class enforces the business rules around appointment status changes.
 */
export class AppointmentStatusStateMachine {
  /**
   * Validates whether a transition is allowed from the current status
   *
   * @param currentStatus - The current appointment status
   * @param action - The transition action to validate
   * @returns Validation result with target status if valid
   */
  static validateTransition(
    currentStatus: AppointmentStatus,
    action: TransitionAction,
  ): TransitionValidationResult {
    const transitions = TRANSITION_MAP[currentStatus];
    const transition = transitions[action];

    if (!transition) {
      const allowedActions = Object.keys(transitions);
      const statusName = STATUS_DISPLAY_NAMES[currentStatus];
      const actionName = ACTION_DISPLAY_NAMES[action];

      let errorMessage: string;

      if (allowedActions.length === 0) {
        errorMessage =
          `Cannot ${actionName} appointment: ${statusName} is a terminal status. ` +
          'No further status changes are allowed.';
      } else {
        const allowedNames = allowedActions.map((a) => ACTION_DISPLAY_NAMES[a as TransitionAction]);
        errorMessage =
          `Cannot ${actionName} appointment with status '${statusName}'. ` +
          `Allowed actions from this status: ${allowedNames.join(', ')}.`;
      }

      return {
        isValid: false,
        errorMessage,
      };
    }

    return {
      isValid: true,
      targetStatus: transition.targetStatus,
    };
  }

  /**
   * Gets the target status for a valid transition
   *
   * @param currentStatus - The current appointment status
   * @param action - The transition action
   * @returns The target status
   * @throws Error if the transition is invalid
   */
  static getTargetStatus(
    currentStatus: AppointmentStatus,
    action: TransitionAction,
  ): AppointmentStatus {
    const result = this.validateTransition(currentStatus, action);

    if (!result.isValid || !result.targetStatus) {
      throw new Error(result.errorMessage || 'Invalid transition');
    }

    return result.targetStatus;
  }

  /**
   * Gets the transition configuration for an action from a status
   *
   * @param currentStatus - The current appointment status
   * @param action - The transition action
   * @returns The transition configuration or undefined if not allowed
   */
  static getTransitionConfig(
    currentStatus: AppointmentStatus,
    action: TransitionAction,
  ): TransitionConfig | undefined {
    return TRANSITION_MAP[currentStatus][action];
  }

  /**
   * Gets all allowed actions from a given status
   *
   * @param currentStatus - The current appointment status
   * @returns Array of allowed transition actions
   */
  static getAllowedActions(currentStatus: AppointmentStatus): TransitionAction[] {
    return Object.keys(TRANSITION_MAP[currentStatus]) as TransitionAction[];
  }

  /**
   * Checks if the given status is a terminal state
   *
   * @param status - The status to check
   * @returns true if the status is terminal (no further transitions)
   */
  static isTerminalStatus(status: AppointmentStatus): boolean {
    return Object.keys(TRANSITION_MAP[status]).length === 0;
  }

  /**
   * Checks if a specific transition is allowed
   *
   * @param currentStatus - The current appointment status
   * @param action - The transition action to check
   * @returns true if the transition is allowed
   */
  static canTransition(currentStatus: AppointmentStatus, action: TransitionAction): boolean {
    return this.validateTransition(currentStatus, action).isValid;
  }

  /**
   * Checks if a transition requires a reason
   *
   * @param currentStatus - The current appointment status
   * @param action - The transition action to check
   * @returns true if the transition requires a reason
   */
  static requiresReason(currentStatus: AppointmentStatus, action: TransitionAction): boolean {
    const config = this.getTransitionConfig(currentStatus, action);
    return config?.requiresReason === true;
  }

  /**
   * Gets a user-friendly description of why a transition failed
   *
   * @param currentStatus - The current appointment status
   * @param action - The attempted action
   * @returns A user-friendly error message
   */
  static getTransitionErrorMessage(
    currentStatus: AppointmentStatus,
    action: TransitionAction,
  ): string {
    const result = this.validateTransition(currentStatus, action);
    return result.errorMessage || 'Unknown error';
  }

  /**
   * Gets the complete state machine definition
   * Useful for documentation and client-side validation
   *
   * @returns The full transition map
   */
  static getStateMachineDefinition(): typeof TRANSITION_MAP {
    return { ...TRANSITION_MAP };
  }

  /**
   * Gets all possible paths from one status to another
   * Useful for determining if a target status is reachable
   *
   * @param fromStatus - The starting status
   * @param toStatus - The target status
   * @param maxDepth - Maximum number of transitions to consider
   * @returns Array of action sequences that lead from fromStatus to toStatus
   */
  static findTransitionPaths(
    fromStatus: AppointmentStatus,
    toStatus: AppointmentStatus,
    maxDepth: number = 5,
  ): TransitionAction[][] {
    const paths: TransitionAction[][] = [];

    const search = (
      current: AppointmentStatus,
      path: TransitionAction[],
      visited: Set<AppointmentStatus>,
    ): void => {
      if (path.length > maxDepth) return;
      if (current === toStatus) {
        paths.push([...path]);
        return;
      }
      if (visited.has(current)) return;

      visited.add(current);

      const actions = this.getAllowedActions(current);
      for (const action of actions) {
        const config = this.getTransitionConfig(current, action);
        if (config) {
          path.push(action);
          search(config.targetStatus, path, new Set(visited));
          path.pop();
        }
      }
    };

    search(fromStatus, [], new Set());
    return paths;
  }
}

export default AppointmentStatusStateMachine;
