import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals: { session } }) => {
    if (!!session?.user) {
        throw redirect(303, "tournament")
    }

    return {
        session,
        user: session?.user
    }
}
