import { handleErrorWithSentry, replayIntegration } from "@sentry/sveltekit";
import * as Sentry from "@sentry/sveltekit";
import packageJson from '../package.json';


Sentry.init({
  dsn: "https://7f56af0e95599f25c04183a3cdb320d3@o4509439160156160.ingest.de.sentry.io/4509439161335888",

  tracesSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // If you don't want to use Session Replay, just remove the line below:
  integrations: [replayIntegration()],

  release: 'v' + packageJson.version,
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
