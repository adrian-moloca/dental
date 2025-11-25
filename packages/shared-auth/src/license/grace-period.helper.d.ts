import { SubscriptionStatus } from '../jwt/jwt-payload.types';
export interface GracePeriodSubscription {
    readonly status: SubscriptionStatus;
    readonly inGracePeriod?: boolean;
    readonly gracePeriodEndsAt?: Date | null;
}
export declare function isInGracePeriod(subscription: GracePeriodSubscription): boolean;
export declare function getGracePeriodDaysRemaining(subscription: GracePeriodSubscription): number;
export declare function isGracePeriodExpiringSoon(subscription: GracePeriodSubscription): boolean;
export declare function isReadOperation(method: string): boolean;
export declare function isWriteOperation(method: string): boolean;
export declare function canPerformOperation(subscription: GracePeriodSubscription, httpMethod: string): boolean;
export declare function canPerformWriteOperation(subscription: GracePeriodSubscription, httpMethod: string): boolean;
export declare function calculateGracePeriodEnd(startDate: Date, gracePeriodDays?: number): Date;
export declare function getGracePeriodStatusMessage(subscription: GracePeriodSubscription): string;
export declare function hasFullAccess(subscription: GracePeriodSubscription): boolean;
