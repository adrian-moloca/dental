import { BaseError } from '../base/base-error';
export declare function mapErrorToHttpStatus(error: BaseError | Error): number;
export declare function mapErrorCodeToHttpStatus(code: string): number;
export declare function isClientError(statusCode: number): boolean;
export declare function isServerError(statusCode: number): boolean;
export declare function getStatusDescription(statusCode: number): string;
