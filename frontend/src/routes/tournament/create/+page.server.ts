import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { zod } from 'sveltekit-superforms/adapters';
import { tournamentSchema } from '$lib/schemas';
import { superValidate } from 'sveltekit-superforms';
import moment from 'moment';
import { DATETIME_WITH_TIMEZONE } from '$lib/constants';

export const load: PageServerLoad = async ({ parent }) => {
    const form = await superValidate(zod(tournamentSchema));
    return { form };
}

export const actions = {
    default: async ({ request, locals: { supabase } }) => {
        const form = await superValidate(request, zod(tournamentSchema))

        if (!form.valid) {
            return fail(400, { form });
        }

        const { data, error } = await supabase
            .from('tournaments')
            .insert({
                name: form.data.name,
                start_date: moment(`${form.data.startDate}T${form.data.startTime}`).format(DATETIME_WITH_TIMEZONE),
                end_date: moment(`${form.data.endDate}T${form.data.endTime}`).format(DATETIME_WITH_TIMEZONE),
                number_of_holes: form.data.holeCount,
                minimum_participants: form.data.minParticipants,
                description: form.data.description,
            })
            .select('id')
            .single();

        if (error) {
            console.log(error.details)
        }

        redirect(303, `/tournament/${data.id}`);
    }
} satisfies Actions