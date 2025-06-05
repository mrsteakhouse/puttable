import type { Actions, PageServerLoad } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { zod } from 'sveltekit-superforms/adapters';
import { tournamentSchema } from '$lib/schemas';
import { superValidate } from 'sveltekit-superforms';
import moment from 'moment';
import { RatingClassDto } from '$lib/dto';
import { patchRatingClasses } from '$lib/server/RatingClassesPatcher';
import * as Sentry from "@sentry/sveltekit";

export const load: PageServerLoad = async ({ locals: { supabase }, parent }) => {
    const form = await superValidate(zod(tournamentSchema));

    const { data, error: err } = await supabase
        .from('rating_classes')
        .select();

    if (err) {
        error(404, { message: "Keine Wertungsklassen gefunden" })
    }

    const ratingClasses: RatingClassDto[] = data?.map(ratingClass => {
        return {
            id: ratingClass.id,
            name: ratingClass.name
        }
    }) ?? [];

    return { form, ratingClasses };
}

export const actions = {
    default: async ({ request, locals: { supabase } }) => {
        const form = await superValidate(request, zod(tournamentSchema))

        if (!form.valid) {
            return fail(400, { form });
        }

        const newRatingClassIds = await patchRatingClasses(supabase, form.data.ratingClasses);

        const { data, error } = await supabase
            .from('tournaments')
            .insert({
                name: form.data.name,
                start_date: moment(`${form.data.startDate}T${form.data.startTime}`).toISOString(),
                end_date: moment(`${form.data.endDate}T${form.data.endTime}`).toISOString(),
                number_of_holes: form.data.holeCount,
                minimum_participants: form.data.minParticipants,
                description: form.data.description,
            })
            .select('id')
            .single();

        if (error || !data) {
            console.error(error);
            Sentry.captureException(error);
            return fail(400, { form });
        }

        // Create rating class associations for all selected rating classes
        const ratingClassAssociations = form.data.ratingClasses
            .filter(ratingClass => ratingClass.id !== undefined)
            .map(ratingClass => ({
                tournament_id: data.id,
                rating_class_id: ratingClass.id
            }));

        // Add associations for newly created rating classes
        const newRatingClassAssociations = newRatingClassIds.map(id => ({
            tournament_id: data.id,
            rating_class_id: id
        }));

        const allAssociations = [...ratingClassAssociations, ...newRatingClassAssociations];

        if (allAssociations.length > 0) {
            const { error: insertError } = await supabase
                .from('rating_classes_to_tournaments')
                .insert(allAssociations);

            if (insertError) {
                console.error('Error creating rating class associations:', insertError);
                Sentry.captureException(insertError);
                return fail(400, { form });
            }
        }

        redirect(303, `/tournament/${data.id}`);
    }
} satisfies Actions
