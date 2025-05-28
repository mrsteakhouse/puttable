// src/routes/tournaments/[id]/sessions/create/+page.server.ts
import { superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { zod } from "sveltekit-superforms/adapters";
import type { SuperValidated } from "sveltekit-superforms";
import { type SessionSchema, sessionSchema } from "$lib/schemas";

export const load: PageServerLoad = async ({ locals: { supabase }, params, parent }) => {
    const layoutData = await parent();
    const tournament = layoutData.tournament;

    if (tournament == null) {
        return fail(404, { message: "Turnier nicht gefunden" })
    }

    const ratingClassIds = tournament.ratingClasses.map(rc => rc.id);

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

    const form: SuperValidated<SessionSchema> = await superValidate({
        tournamentId: tournament.id,
        tournamentHoles: tournament.numberOfHoles,
        player: []
    }, zod(sessionSchema));

    return { form, players };
};

export const actions: Actions = {
    default: async ({ locals: { supabase }, request }) => {
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
            player: player.id,
            data: Array(form.data.tournamentHoles).fill(0)
        }));

        await supabase.from('scorecards').insert(scorecardInserts);

        throw redirect(303, `/session/${session.id}`);
    },
};
