import * as Sentry from "@sentry/astro";

const dsn =
  process.env.PUBLIC_SENTRY_DSN ||
  process.env.SENTRY_DSN ||
  "https://309b64e0510ceade35ab656271c4f9c4@o4512255825346560.ingest.de.sentry.io/4512280955125840";

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
    environment: process.env.NODE_ENV || "production",
  });
}
