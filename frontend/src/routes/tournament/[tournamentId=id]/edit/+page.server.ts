import type { Actions } from '@sveltejs/kit';
import { tournamentFormDataToDb } from '$lib/server/utilties';
import { goto } from '$app/navigation';
import type { Tournament } from '$lib/global.types';

export const actions = {
    default: async ({request, locals: {supabase}, params}) => {
        const formData = await request.formData();
        const dbData: Tournament = tournamentFormDataToDb(formData);

        const result = await supabase
            .from('tournaments')
            .update(dbData)
            .eq('id', params.tournamentId);

        if (result.error) {
            alert(result.error.details)
        }

        return {success: true}
    }
} satisfies Actions