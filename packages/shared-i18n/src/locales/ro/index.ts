/**
 * Romanian Locale Bundle
 *
 * Exports all Romanian translations for Dental OS.
 */

export { roCommon, type RoCommonTranslations } from './common';
export { roDental, type RoDentalTranslations } from './dental';
export { roBilling, type RoBillingTranslations } from './billing';

import { roCommon } from './common';
import { roDental } from './dental';
import { roBilling } from './billing';

/**
 * Complete Romanian translation bundle
 */
export const ro = {
  common: roCommon,
  dental: roDental,
  billing: roBilling,
} as const;

export type RoTranslations = typeof ro;
