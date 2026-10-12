/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="node" />

interface Window {
  __PUBLIC_ENV__?: Record<string, string | undefined>;
}

interface ImportMetaEnv {
  readonly PROD?: boolean;
  readonly DEV?: boolean;
  readonly SSR?: boolean;
  readonly MODE?: string;
  readonly NEXT_PUBLIC_SITE_URL?: string;
  readonly NEXT_PUBLIC_POCKETBASE_URL?: string;
  readonly NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
  readonly NEXT_PUBLIC_GA_ID?: string;
  readonly NEXT_PUBLIC_GTM_ID?: string;
  readonly NEXT_PUBLIC_PUSDATIN_URL?: string;
  readonly PUBLIC_API_URL?: string;
  readonly NEXT_PUBLIC_ONESIGNAL_APP_ID?: string;
  readonly PUBLIC_ONESIGNAL_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*?raw" {
  const content: string;
  export default content;
}

