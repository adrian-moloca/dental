/**
 * Search Configuration Schema
 * Re-exports search configuration from shared-infra
 */

import { OpenSearchConfig, loadOpenSearchConfig } from '@dentalos/shared-infra';

/**
 * Re-export OpenSearch configuration type
 */
export type { OpenSearchConfig };

/**
 * Re-export OpenSearch configuration loader
 */
export { loadOpenSearchConfig };
