import { superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { zod } from "sveltekit-superforms/adapters";
import type { SuperValidated } from "sveltekit-superforms";
import { playerFormSchema, type SessionSchema, sessionSchema } from "$lib/schemas";
import type { RatingClassDto } from '$lib/dto';
import { hasPermission } from '$lib/rbac';
import { Action, Resource } from '$lib/permissions';
import * as Sentry from "@sentry/sveltekit";

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
    if (!await hasPermission(supabase, Resource.Sessions, Action.Create)) {
        return redirect(303, '/');
    }

    // Fetch all players
    const { data: playersData, error: playersError } = await supabase.from('players')
        .select();

    if (playersError) {
        Sentry.captureException(playersError);
        error(500, { message: playersError.message });
    }

    const players = playersData.map(player => {
        return {
            id: player.id,
            firstName: player.firstname,
            lastName: player.lastname,
        }
    });

    // Fetch all rating classes for the player creation form
    const { data: ratingClassesData, error: ratingClassesError } = await supabase
        .from('rating_classes')
        .select();

    if (ratingClassesError) {
        Sentry.captureException(ratingClassesError);
        error(500, { message: ratingClassesError.message });
    }

    // Format rating classes for the dropdown in the player creation modal
    const formattedRatingClasses: RatingClassDto[] = ratingClassesData.map(rc => ({
        id: rc.id,
        name: rc.name
    }));

    // Initialize the session form
    const form: SuperValidated<SessionSchema> = await superValidate({
        player: [],
        holeCount: 18,
        tournamentId: 0
    }, zod(sessionSchema));

    // Initialize the player form for the modal
    const playerForm = await superValidate(zod(playerFormSchema));

    return {
        form,
        players,
        ratingClasses: formattedRatingClasses,
        playerForm
    };
};

export const actions: Actions = {
    createSession: async ({ locals: { supabase }, request }) => {
        const form = await superValidate(request, zod(sessionSchema));
        if (!form.valid) return { form };

        // Create a new session without a tournament_id (freeplay mode)
        const { data: session, error: sErr } = await supabase
            .from('sessions')
            .insert({
                submitted_at: null,
                // tournament_id is not provided, so it will be NULL
            })
            .select()
            .single();

        if (sErr || !session) {
            Sentry.captureException(sErr);
            return fail(500, { message: sErr?.message, form });
        }

        // Create scorecards for each player
        const scorecardInserts = form.data.player.map(player => ({
            session_id: session.id,
            player_id: player.id,
            data: Array(form.data.holeCount).fill(0)
        }));

        const { error } = await supabase.from('scorecards').insert(scorecardInserts);

        if (error) {
            Sentry.captureException(error);
            return fail(500, { message: error.message, form });
        }

        throw redirect(303, `/session/${session.id}`);
    },

    // Action for creating a new player
    createPlayer: async ({ request, locals: { supabase } }) => {
        // Validate form data
        const form = await superValidate(request, zod(playerFormSchema));

        if (!form.valid) {
            return fail(400, { form });
        }

        // Insert new player
        const { data, error } = await supabase
            .from('players')
            .insert({
                firstname: form.data.firstName,
                lastname: form.data.lastName,
                rating_class_id: form.data.ratingClassId
            })
            .select()
            .single();

        if (error) {
            Sentry.captureException(error);
            return fail(500, {
                form,
                message: error.message
            });
        }

        // Return the created player data
        return {
            form,
            player: {
                id: data.id,
                firstName: data.firstname,
                lastName: data.lastname
            }
        };
    },
};