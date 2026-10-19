/// <reference types="astro/client" />
import * as Sentry from "@sentry/astro";

const dsn =
  (typeof window !== "undefined" && (window as any).__PUBLIC_ENV__?.PUBLIC_SENTRY_DSN) ||
  import.meta.env.PUBLIC_SENTRY_DSN ||
  process.env.PUBLIC_SENTRY_DSN ||
  "https://309b64e0510ceade35ab656271c4f9c4@o4512255825346560.ingest.de.sentry.io/4512280955125840";

if (dsn) {
  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Tracing sample rate: 100% in development, 20% in production
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    // Session Replay: capture 100% of sessions with errors
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE || process.env.NODE_ENV || "production",
  });

  // Attach Sentry to global window so Wappalyzer and developer tools detect it
  if (typeof window !== "undefined") {
    (window as any).Sentry = Sentry;
  }
}
