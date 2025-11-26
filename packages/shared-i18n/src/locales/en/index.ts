/**
 * English Locale Bundle (Fallback)
 *
 * English translations for Dental OS.
 * Used as fallback when Romanian translation is not available.
 */

export const enCommon = {
  actions: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    add: 'Add',
    remove: 'Remove',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    close: 'Close',
    open: 'Open',
    view: 'View',
    print: 'Print',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    retry: 'Retry',
    yes: 'Yes',
    no: 'No',
  },
  status: {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    draft: 'Draft',
    approved: 'Approved',
    rejected: 'Rejected',
    expired: 'Expired',
    archived: 'Archived',
  },
  validation: {
    required: 'This field is required',
    invalidEmail: 'Invalid email address',
    invalidPhone: 'Invalid phone number',
    minLength: 'Minimum {{count}} characters',
    maxLength: 'Maximum {{count}} characters',
    passwordMismatch: 'Passwords do not match',
    invalidDate: 'Invalid date',
    invalidFormat: 'Invalid format',
    alreadyExists: 'Already exists',
    notFound: 'Not found',
  },
  errors: {
    generic: 'An error occurred. Please try again.',
    network: 'Network error. Check your internet connection.',
    unauthorized: 'You are not authorized for this action.',
    forbidden: 'Access forbidden.',
    notFound: 'Resource not found.',
    serverError: 'Server error. Contact technical support.',
    timeout: 'Request timed out. Try again.',
    sessionExpired: 'Session expired. Please log in again.',
  },
  success: {
    saved: 'Saved successfully',
    created: 'Created successfully',
    updated: 'Updated successfully',
    deleted: 'Deleted successfully',
    sent: 'Sent successfully',
    imported: 'Imported successfully',
    exported: 'Exported successfully',
  },
} as const;

export const en = {
  common: enCommon,
} as const;

export type EnTranslations = typeof en;
