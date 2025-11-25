/**
 * Scheduling Module Permissions
 * Covers: appointments, availability, reminders, waitlist
 *
 * DESIGN PRINCIPLES:
 * - Fine-grained permissions for precise access control
 * - Standard action verbs: create, read, update, delete, list, manage
 * - Immutable permission codes (never rename or delete)
 */

/**
 * Appointment management permissions
 */
export const SCHEDULING_PERMISSIONS = {
  APPOINTMENT: {
    /**
     * Create new patient appointments
     * Grants: Schedule appointments in the calendar
     * Used by: receptionist, clinic_manager, doctor (own schedule)
     */
    CREATE: 'scheduling.appointment.create',

    /**
     * View individual appointment details
     * Grants: Read appointment information including patient, provider, and notes
     * Used by: All clinical and front-desk staff
     */
    READ: 'scheduling.appointment.read',

    /**
     * Modify existing appointments
     * Grants: Reschedule, update notes, change provider assignment
     * Used by: receptionist, clinic_manager
     */
    UPDATE: 'scheduling.appointment.update',

    /**
     * Cancel appointments
     * Grants: Cancel or delete appointments from calendar
     * Used by: receptionist, clinic_manager
     */
    DELETE: 'scheduling.appointment.delete',

    /**
     * View appointment lists and calendar views
     * Grants: Access to calendar, agenda, and appointment search
     * Used by: All staff members
     */
    LIST: 'scheduling.appointment.list',

    /**
     * Full appointment management (CRUD)
     * Grants: All appointment operations
     * Used by: receptionist, clinic_manager
     * Note: This is a convenience permission. Prefer granular permissions when possible.
     */
    MANAGE: 'scheduling.appointment.manage',
  },

  AVAILABILITY: {
    /**
     * Manage provider availability and schedules
     * Grants: Set working hours, time blocks, PTO, recurring schedules
     * Used by: clinic_manager, doctor (own schedule)
     */
    MANAGE: 'scheduling.availability.manage',
  },

  REMINDER: {
    /**
     * Configure appointment reminder settings
     * Grants: Manage reminder rules, templates, and delivery channels
     * Used by: clinic_manager, tenant_admin
     */
    MANAGE: 'scheduling.reminder.manage',
  },
} as const;

/**
 * Flatten scheduling permissions into array for validation and iteration
 */
export const SCHEDULING_PERMISSION_LIST = Object.values(SCHEDULING_PERMISSIONS).flatMap(
  (category) => Object.values(category)
);

/**
 * Permission count for this module
 */
export const SCHEDULING_PERMISSION_COUNT = SCHEDULING_PERMISSION_LIST.length;
