export interface LogContext {
  correlationId?: string;
  tenantId?: string;
  organizationId?: string;
  clinicId?: string;
  userId?: string;
  action?: string;
  resource?: string;
  [key: string]: any;
}

export interface StructuredLog {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const PHI_FIELDS = [
  'ssn',
  'socialSecurityNumber',
  'dateOfBirth',
  'dob',
  'birthDate',
  'phone',
  'phoneNumber',
  'mobile',
  'email',
  'address',
  'street',
  'city',
  'zipCode',
  'postalCode',
  'medicalRecordNumber',
  'mrn',
  'patientId',
  'firstName',
  'lastName',
  'fullName',
  'name',
  'creditCard',
  'cardNumber',
  'cvv',
  'password',
  'token',
  'secret',
  'apiKey',
];

const REDACTED = '[REDACTED]';

export function maskPHI(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskPHI(item));
  }

  if (typeof data === 'object') {
    const masked: any = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();

      if (PHI_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()))) {
        masked[key] = REDACTED;
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = maskPHI(value);
      } else {
        masked[key] = value;
      }
    }

    return masked;
  }

  return data;
}

export function createStructuredLog(
  level: StructuredLog['level'],
  message: string,
  context?: LogContext,
  error?: Error
): StructuredLog {
  const log: StructuredLog = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  if (context) {
    log.context = maskPHI(context);
  }

  if (error) {
    log.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return log;
}

export class StructuredLogger {
  constructor(
    private readonly serviceName: string,
    private readonly defaultContext?: LogContext
  ) {}

  private log(level: StructuredLog['level'], message: string, context?: LogContext, error?: Error): void {
    const mergedContext = { ...this.defaultContext, ...context, service: this.serviceName };
    const log = createStructuredLog(level, message, mergedContext, error);
    console.log(JSON.stringify(log));
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error);
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    this.log('fatal', message, context, error);
  }
}

export function createLogger(serviceName: string, defaultContext?: LogContext): StructuredLogger {
  return new StructuredLogger(serviceName, defaultContext);
}
