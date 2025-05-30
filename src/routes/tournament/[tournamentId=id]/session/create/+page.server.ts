// src/routes/tournaments/[id]/sessions/create/+page.server.ts
import { superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { zod } from "sveltekit-superforms/adapters";
import type { SuperValidated } from "sveltekit-superforms";
import { type SessionSchema, sessionSchema } from "$lib/schemas";
import { z } from 'zod';
import type { RatingClassDto } from '$lib/dto';
import { hasPermission } from '$lib/rbac';
import { Action, Resource } from '$lib/permissions';

// Create a schema for the player creation form
const playerFormSchema = z.object({
    firstName: z.string().min(1, "Vorname muss angegeben werden"),
    lastName: z.string().min(1, "Nachname muss angegeben werden"),
    ratingClassId: z.number().min(1, "Wertungsklasse muss ausgewählt werden")
});

export const load: PageServerLoad = async ({ locals: { supabase }, params, parent }) => {
    if (!await hasPermission(supabase, Resource.Sessions, Action.Create)) {
        throw redirect(303, `/tournament/${params.tournamentId}`);
    }

    const layoutData = await parent();
    const tournament = layoutData.tournament;

    if (tournament == null) {
        return fail(404, { message: "Turnier nicht gefunden" })
    }

    const ratingClassIds = tournament.ratingClasses.map(rc => rc.id);

    // Fetch players for the tournament's rating classes
    const { data, error } = await supabase.from('players')
        .select()
        .in('rating_class_id', ratingClassIds);

    if (error && !data) {
        fail(500, { message: error.message });
        return;
    }

    const players = data.map(player => {
        return {
            id: player.id,
            firstName: player.firstname,
            lastName: player.lastname,
        }
    });

    // Format rating classes for the dropdown in the player creation modal
    const formattedRatingClasses: RatingClassDto[] = tournament.ratingClasses.map(rc => ({
        id: rc.id,
        name: rc.name
    }));

    // Initialize the session form
    const form: SuperValidated<SessionSchema> = await superValidate({
        tournamentId: tournament.id,
        holeCount: tournament.numberOfHoles,
        player: []
    }, zod(sessionSchema));

    // Initialize the player form for the modal
    const playerForm = await superValidate(zod(playerFormSchema));

    return {
        form,
        players,
        ratingClasses: formattedRatingClasses,
        playerForm,
        tournament
    };
};

export const actions: Actions = {
    createSession: async ({ locals: { supabase }, request }) => {
        const form = await superValidate(request, zod(sessionSchema));
        if (!form.valid) return { form };

        const { data: session, error: sErr } = await supabase
            .from('sessions')
            .insert({
                tournament_id: form.data.tournamentId,
                submitted_at: null,
            })
            .select()
            .single();

        if (sErr || !session) {
            return { form };
        }

        // Scorecards anlegen
        const scorecardInserts = form.data.player.map(player => ({
            session_id: session.id,
            player_id: player.id,
            data: Array(form.data.holeCount).fill(0)
        }));

        const {error } = await supabase.from('scorecards').insert(scorecardInserts);

        if (error) {
            return fail(500, {message: error.message, form});
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
