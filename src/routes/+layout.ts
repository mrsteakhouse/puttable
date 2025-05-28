import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr'
import { env } from '$env/dynamic/public'
import type { LayoutLoad } from './$types'
import type { Database } from "$lib/database.types";

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
    /**
     * Declare a dependency so the layout can be invalidated, for example, on
     * session refresh.
     */
    depends('supabase:auth')

    const supabase = isBrowser()
        ? createBrowserClient<Database>(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY, {
            global: {
                fetch,
            },
        })
        : createServerClient<Database>(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY, {
            global: {
                fetch,
            },
            cookies: {
                getAll() {
                    return data.cookies
                },
            },
        })

    const {
        data: { user },
    } = await supabase.auth.getUser()

    /**
     * It's fine to use `getSession` here, because on the client, `getSession` is
     * safe, and on the server, it reads `session` from the `LayoutData`, which
     * safely checked the session using `safeGetSession`.
     */
    const {
        data: { session },
    } = await supabase.auth.getSession()

    const authenticated: boolean = user?.is_anonymous ?? false;

    return { session, supabase, user, authenticated }
}