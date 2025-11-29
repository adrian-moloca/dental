/**
 * E-Factura Events Index
 *
 * Central export point for all E-Factura domain events.
 */

export {
  // Base interfaces
  EFacturaEventBase,

  // Event types
  EFacturaGeneratedEvent,
  EFacturaSubmittedEvent,
  EFacturaValidatedEvent,
  EFacturaAcceptedEvent,
  EFacturaRejectedEvent,
  EFacturaErrorEvent,
  EFacturaDownloadedEvent,
  EFacturaCancelledEvent,
  EFacturaTokenRefreshedEvent,
  EFacturaAuthRequiredEvent,

  // Union type
  EFacturaEvent,
  EFacturaEventName,

  // Event name constants
  EFACTURA_EVENTS,

  // Factory functions
  createEFacturaGeneratedEvent,
  createEFacturaSubmittedEvent,
  createEFacturaValidatedEvent,
  createEFacturaAcceptedEvent,
  createEFacturaRejectedEvent,
  createEFacturaErrorEvent,
  createEFacturaDownloadedEvent,
  createEFacturaCancelledEvent,
  createEFacturaTokenRefreshedEvent,
  createEFacturaAuthRequiredEvent,
} from './e-factura.events';
