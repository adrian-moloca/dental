/**
 * E-Factura Exceptions Index
 *
 * Central export point for all E-Factura custom exceptions.
 */

export {
  // Base exception
  EFacturaException,

  // XML-related exceptions
  XmlGenerationException,
  XmlValidationException,

  // ANAF API exceptions
  AnafApiException,
  AnafRejectionException,
  AnafConnectivityException,

  // OAuth exceptions
  OAuthException,
  TokenExpiredException,
  TokenNotFoundExeption,

  // Invoice/Submission exceptions
  InvoiceNotEligibleException,
  DuplicateSubmissionException,
  SubmissionNotFoundException,
  SubmissionNotCancellableException,
  SubmissionNotRetryableException,
  SignedInvoiceNotAvailableException,

  // Configuration exceptions
  SellerConfigurationException,
  BuyerInfoMissingException,

  // Utility function
  mapAnafErrorToException,
} from './e-factura.exceptions';
