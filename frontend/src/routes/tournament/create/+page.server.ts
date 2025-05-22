import type { Actions } from "./$types";
import { goto } from '$app/navigation';
import { tournamentFormDataToDb } from '$lib/server/utilties';

export const actions = {
    default: async ({ request, locals: { supabase } }) => {
        const formData = await request.formData();
        const dbData = tournamentFormDataToDb(formData);

        const { data, error } = await supabase
            .from('tournaments')
            .insert(dbData)
            .select()
            .single();

        if (error) {
            alert(error.details)
        } else {
            await goto('/');
        }

        return { success: true, nextId: data.id }
    }
} satisfies Actions