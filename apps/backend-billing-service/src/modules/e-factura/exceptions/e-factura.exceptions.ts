import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base class for all E-Factura related exceptions
 */
export class EFacturaException extends HttpException {
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: Record<string, unknown>,
  ) {
    super(
      {
        statusCode: status,
        error: 'E-Factura Error',
        code,
        message,
        details,
      },
      status,
    );
    this.code = code;
    this.details = details;
  }
}

/**
 * Thrown when XML generation fails
 */
export class XmlGenerationException extends EFacturaException {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'XML_GENERATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, details);
  }
}

/**
 * Thrown when XML validation fails before submission
 */
export class XmlValidationException extends EFacturaException {
  readonly validationErrors: Array<{ code: string; message: string; field?: string }>;

  constructor(
    message: string,
    validationErrors: Array<{ code: string; message: string; field?: string }>,
    details?: Record<string, unknown>,
  ) {
    super(message, 'XML_VALIDATION_ERROR', HttpStatus.BAD_REQUEST, {
      ...details,
      validationErrors,
    });
    this.validationErrors = validationErrors;
  }
}

/**
 * Thrown when ANAF API returns an error
 */
export class AnafApiException extends EFacturaException {
  readonly anafErrorCode?: string;
  readonly anafResponse?: unknown;

  constructor(
    message: string,
    anafErrorCode?: string,
    anafResponse?: unknown,
    status: HttpStatus = HttpStatus.BAD_GATEWAY,
  ) {
    super(message, 'ANAF_API_ERROR', status, {
      anafErrorCode,
      anafResponse,
    });
    this.anafErrorCode = anafErrorCode;
    this.anafResponse = anafResponse;
  }
}

/**
 * Thrown when ANAF rejects the invoice
 */
export class AnafRejectionException extends EFacturaException {
  readonly rejectionErrors: Array<{ code: string; message: string; field?: string }>;

  constructor(
    message: string,
    rejectionErrors: Array<{ code: string; message: string; field?: string }>,
    uploadIndex?: string,
  ) {
    super(message, 'ANAF_REJECTION', HttpStatus.UNPROCESSABLE_ENTITY, {
      rejectionErrors,
      uploadIndex,
    });
    this.rejectionErrors = rejectionErrors;
  }
}

/**
 * Thrown when OAuth authentication fails
 */
export class OAuthException extends EFacturaException {
  constructor(message: string, cui?: string, details?: Record<string, unknown>) {
    super(message, 'OAUTH_ERROR', HttpStatus.UNAUTHORIZED, {
      cui,
      ...details,
    });
  }
}

/**
 * Thrown when OAuth token is expired and cannot be refreshed
 */
export class TokenExpiredException extends OAuthException {
  constructor(cui: string) {
    super(
      `OAuth token for CUI ${cui} has expired. Please re-authorize through ANAF SPV portal.`,
      cui,
      { requiresReauthorization: true },
    );
  }
}

/**
 * Thrown when no OAuth tokens are available for a CUI
 */
export class TokenNotFoundExeption extends OAuthException {
  constructor(cui: string) {
    super(
      `No OAuth tokens found for CUI ${cui}. Please complete the OAuth authorization flow.`,
      cui,
      { requiresInitialAuthorization: true },
    );
  }
}

/**
 * Thrown when invoice is not eligible for E-Factura submission
 */
export class InvoiceNotEligibleException extends EFacturaException {
  constructor(message: string, invoiceId: string, reason: string) {
    super(message, 'INVOICE_NOT_ELIGIBLE', HttpStatus.BAD_REQUEST, {
      invoiceId,
      reason,
    });
  }
}

/**
 * Thrown when a duplicate submission is detected
 */
export class DuplicateSubmissionException extends EFacturaException {
  readonly existingSubmissionId: string;

  constructor(invoiceId: string, existingSubmissionId: string, status: string) {
    super(
      `Invoice ${invoiceId} already has an active submission (${status})`,
      'DUPLICATE_SUBMISSION',
      HttpStatus.CONFLICT,
      { invoiceId, existingSubmissionId, status },
    );
    this.existingSubmissionId = existingSubmissionId;
  }
}

/**
 * Thrown when submission is not found
 */
export class SubmissionNotFoundException extends EFacturaException {
  constructor(submissionId: string) {
    super(
      `E-Factura submission ${submissionId} not found`,
      'SUBMISSION_NOT_FOUND',
      HttpStatus.NOT_FOUND,
      { submissionId },
    );
  }
}

/**
 * Thrown when submission cannot be cancelled
 */
export class SubmissionNotCancellableException extends EFacturaException {
  constructor(submissionId: string, status: string, reason: string) {
    super(
      `Cannot cancel submission ${submissionId}: ${reason}`,
      'SUBMISSION_NOT_CANCELLABLE',
      HttpStatus.BAD_REQUEST,
      { submissionId, status, reason },
    );
  }
}

/**
 * Thrown when submission cannot be retried
 */
export class SubmissionNotRetryableException extends EFacturaException {
  constructor(submissionId: string, status: string, retryCount: number, maxRetries: number) {
    super(
      `Cannot retry submission ${submissionId}. Status: ${status}, Retries: ${retryCount}/${maxRetries}`,
      'SUBMISSION_NOT_RETRYABLE',
      HttpStatus.BAD_REQUEST,
      { submissionId, status, retryCount, maxRetries },
    );
  }
}

/**
 * Thrown when signed invoice cannot be downloaded
 */
export class SignedInvoiceNotAvailableException extends EFacturaException {
  constructor(submissionId: string, status: string) {
    super(
      `Signed invoice not available for submission ${submissionId}. Current status: ${status}`,
      'SIGNED_INVOICE_NOT_AVAILABLE',
      HttpStatus.BAD_REQUEST,
      { submissionId, status },
    );
  }
}

/**
 * Thrown when ANAF connectivity fails
 */
export class AnafConnectivityException extends EFacturaException {
  constructor(message: string) {
    super(message, 'ANAF_CONNECTIVITY_ERROR', HttpStatus.SERVICE_UNAVAILABLE, {
      suggestion: 'Please check network connectivity and ANAF service status',
    });
  }
}

/**
 * Thrown when required seller configuration is missing
 */
export class SellerConfigurationException extends EFacturaException {
  constructor(clinicId: string, missingFields: string[]) {
    super(
      `Seller configuration incomplete for clinic ${clinicId}. Missing: ${missingFields.join(', ')}`,
      'SELLER_CONFIG_MISSING',
      HttpStatus.PRECONDITION_FAILED,
      { clinicId, missingFields },
    );
  }
}

/**
 * Thrown when required buyer information is missing for B2B invoice
 */
export class BuyerInfoMissingException extends EFacturaException {
  constructor(invoiceId: string, missingFields: string[]) {
    super(
      `Buyer information incomplete for invoice ${invoiceId}. Missing: ${missingFields.join(', ')}`,
      'BUYER_INFO_MISSING',
      HttpStatus.BAD_REQUEST,
      { invoiceId, missingFields },
    );
  }
}

/**
 * Map ANAF error codes to exception types
 */
export function mapAnafErrorToException(
  errorCode: string,
  errorMessage: string,
  uploadIndex?: string,
): EFacturaException {
  const errorMappings: Record<string, () => EFacturaException> = {
    XML_INVALID: () =>
      new XmlValidationException(errorMessage, [{ code: errorCode, message: errorMessage }]),
    CAMP_LIPSA: () =>
      new XmlValidationException(errorMessage, [{ code: errorCode, message: errorMessage }]),
    CUI_INVALID: () =>
      new XmlValidationException('Invalid CUI format', [
        { code: errorCode, message: errorMessage },
      ]),
    AUTH_EROARE: () => new OAuthException(errorMessage),
    LIMITA_DEPASITA: () =>
      new AnafApiException(
        'Rate limit exceeded. Please wait before retrying.',
        errorCode,
        null,
        HttpStatus.TOO_MANY_REQUESTS,
      ),
    EROARE_SERVER: () =>
      new AnafApiException('ANAF server error', errorCode, null, HttpStatus.BAD_GATEWAY),
    FACTURA_DUPLICAT: () =>
      new DuplicateSubmissionException('unknown', uploadIndex || 'unknown', 'DUPLICATE'),
  };

  const exceptionFactory = errorMappings[errorCode];
  if (exceptionFactory) {
    return exceptionFactory();
  }

  return new AnafApiException(errorMessage, errorCode);
}
