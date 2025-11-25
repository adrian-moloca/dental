/**
 * Cabinets module barrel export
 * @module modules/cabinets
 */

// Module
export { CabinetsModule } from './cabinets.module';

// Entity
export { Cabinet, type CabinetSettings } from './entities/cabinet.entity';

// DTOs and Schemas
export * from './dto';

// Service
export { CabinetService } from './services/cabinet.service';

// Repository
export { CabinetRepository } from './repositories/cabinet.repository';
