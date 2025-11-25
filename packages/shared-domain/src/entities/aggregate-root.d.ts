import type { UUID, ISODateString } from '@dentalos/shared-types';
import type { OrganizationId, ClinicId } from '@dentalos/shared-types';
import { BaseEntity } from './base-entity';
import { DomainEvent } from '../events/domain-event';
export declare abstract class AggregateRoot extends BaseEntity {
    private readonly _domainEvents;
    protected constructor(id: UUID, organizationId: OrganizationId, clinicId: ClinicId | undefined, createdAt?: ISODateString, updatedAt?: ISODateString);
    getDomainEvents(): readonly DomainEvent[];
    protected addDomainEvent(event: DomainEvent): void;
    clearDomainEvents(): void;
    hasDomainEvents(): boolean;
    getDomainEventCount(): number;
    getEventsByType(eventType: string): readonly DomainEvent[];
}
