/// <reference types="vite/client" />

// Build-time constants injected by Vite
declare const __BUILD_TIME__: string;

interface ImportMetaEnv {
  readonly VITE_AUTH_API_URL: string;
  readonly VITE_PATIENT_API_URL: string;
  readonly VITE_PROVIDER_API_URL: string;
  readonly VITE_SCHEDULING_API_URL: string;
  readonly VITE_CLINICAL_API_URL: string;
  readonly VITE_BILLING_API_URL: string;
  readonly VITE_INVENTORY_API_URL: string;
  readonly VITE_ENTERPRISE_API_URL: string;
  readonly VITE_HEALTH_AGGREGATOR_URL: string;
  readonly VITE_IMAGING_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot: any;
}
