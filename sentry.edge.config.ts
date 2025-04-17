// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { env } from '@/env'
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://251ae8586c64680d269d3f108b508677@o4508506299564032.ingest.de.sentry.io/4509168442671184',

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  environment: env.NEXT_PUBLIC_APP_ENV,
})
