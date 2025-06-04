import * as Sentry from "@sentry/sveltekit";
import { createServerClient } from "@supabase/ssr";
import { type Handle, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

import { env } from "$env/dynamic/public";
import type { Database } from "$lib/database.types";
import { paraglideMiddleware } from "$lib/paraglide/server";

Sentry.init({
  dsn: "https://7f56af0e95599f25c04183a3cdb320d3@o4509439160156160.ingest.de.sentry.io/4509439161335888",
  tracesSampleRate: 1,
});

const supabase: Handle = async ({ event, resolve }) => {
  /**
   * Creates a Supabase client specific to this server request.
   *
   * The Supabase client gets the Auth token from the request cookies.
   */
  event.locals.supabase = createServerClient<Database>(
    env.PUBLIC_SUPABASE_URL,
    env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        /**
         * SvelteKit's cookies API requires `path` to be explicitly set in
         * the cookie options. Setting `path` to `/` replicates previous/
         * standard behavior.
         */
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: "/" });
          });
        },
      },
    },
  );

  /**
   * Unlike `supabase.auth.getSession()`, which returns the session _without_
   * validating the JWT, this function also calls `getUser()` to validate the
   * JWT before returning the session.
   */
  event.locals.safeGetSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession();
    if (!session) {
      return { session: null, user: null };
    }

    const {
      data: { user },
      error,
    } = await event.locals.supabase.auth.getUser();
    if (error) {
      // JWT validation has failed
      return { session: null, user: null };
    }

    return { session, user };
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      /**
       * Supabase libraries use the `content-range` and `x-supabase-api-version`
       * headers, so we need to tell SvelteKit to pass it through.
       */
      return name === "content-range" || name === "x-supabase-api-version";
    },
  });
};

const authGuard: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  if (!event.locals.session && event.url.pathname.startsWith("/admin")) {
    redirect(303, "/");
  }
  return resolve(event);
};

// creating a handle to use the paraglide middleware
const paraglideHandle: Handle = ({ event, resolve }) =>
  paraglideMiddleware(
    event.request,
    ({ request: localizedRequest, locale }) => {
      event.request = localizedRequest;
      return resolve(event, {
        transformPageChunk: ({ html }) => {
          return html.replace("%lang%", locale);
        },
      });
    },
  );

export const handle: Handle = sequence(
  Sentry.sentryHandle(),
  sequence(supabase, authGuard, paraglideHandle),
);
export const handleError = Sentry.handleErrorWithSentry();
