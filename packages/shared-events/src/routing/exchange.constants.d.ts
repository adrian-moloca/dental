export declare const DOMAIN_EVENTS_EXCHANGE: "dental.domain.events";
export declare const INTEGRATION_EVENTS_EXCHANGE: "dental.integration.events";
export declare const DEAD_LETTER_EXCHANGE: "dental.dlx";
export type ExchangeName = typeof DOMAIN_EVENTS_EXCHANGE | typeof INTEGRATION_EVENTS_EXCHANGE | typeof DEAD_LETTER_EXCHANGE;
