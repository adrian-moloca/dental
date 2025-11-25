import { ZodError } from 'zod';
export interface FieldError {
    field: string;
    message: string;
    code: string;
    context?: Record<string, unknown>;
}
export interface FormattedError {
    message: string;
    fields: FieldError[];
    count: number;
    timestamp: string;
}
export declare function formatZodError(error: ZodError, defaultMessage?: string): FormattedError;
export declare function getFieldErrors(error: ZodError): Record<string, string[]>;
export declare function getSingleErrorMessage(error: ZodError, defaultMessage?: string): string;
export declare function getAllErrorMessages(error: ZodError): string[];
export declare function hasFieldError(error: ZodError, fieldPath: string): boolean;
export declare function getFieldErrorMessages(error: ZodError, fieldPath: string): string[];
export declare function formatApiError(error: ZodError, statusCode?: number): {
    success: false;
    error: {
        code: string;
        message: string;
        statusCode: number;
        details: FormattedError;
    };
};
export declare function createUserFriendlyMessage(error: ZodError): string;
