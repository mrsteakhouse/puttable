// src/routes/sessions/[id]/+page.server.ts
import type { PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { type SessionDto } from '$lib/dto';
import type { QueryData } from '@supabase/supabase-js';
import type { Actions } from './$types';
import { hasPermission } from '$lib/rbac';
import { Action, Resource } from '$lib/permissions';

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
    if (!await hasPermission(supabase, Resource.Sessions, Action.Read)) {
        throw redirect(303, '/');
    }

    const scoreCardQuery = supabase
        .from('sessions')
        .select("id, submitted_at, tournament:tournaments(id, name, number_of_holes), scorecards(id, data, player:players(id, firstname, lastname))")
        .eq('id', params.sessionId)
        .single();

    type ScoreCardQuery = QueryData<typeof scoreCardQuery>;

    const { data, error: sErr } = await scoreCardQuery;
    if (sErr || !data || data.length === 0) throw fail(404, { message: 'Session nicht gefunden' });

    const typedData: ScoreCardQuery = data;

    // Fetch all players for the add player modal
    const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('id, firstname, lastname');

    if (playersError) {
        console.error('Error fetching players:', playersError);
    }

    // Format players for the add player modal
    const players = playersData ? playersData.map(player => ({
        id: player.id,
        firstName: player.firstname,
        lastName: player.lastname
    })) : [];

    // Check if this is a freeplay session (no tournament)
    const isFreeplay = !typedData.tournament;

    // For freeplay sessions, we need to determine the number of holes from the first scorecard
    const holes = isFreeplay
        ? (typedData.scorecards.length > 0 ? typedData.scorecards[0].data.length : 0)
        : typedData.tournament.number_of_holes;

    const sessionData = {
        id: typedData.id,
        tournamentId: isFreeplay ? null : typedData.tournament.id,
        tournamentName: isFreeplay ? "Freies Spiel" : typedData.tournament.name,
        holes: holes,
        submissionDateTime: typedData.submitted_at,
        isFreeplay: isFreeplay,
        scorecard: typedData.scorecards.map((scorecard: {
            id: number,
            data: number[],
            player: { id: number, firstname: string, lastname: string }
        }) => {
            return {
                id: scorecard.id,
                data: scorecard.data,
                player: {
                    id: scorecard.player.id,
                    firstName: scorecard.player.firstname,
                    lastName: scorecard.player.lastname
                }
            }
        })
    } as SessionDto

    return {
        session: sessionData,
        players: players
    };
};

export const actions: Actions = {
    deleteSession: async ({ params, locals: { supabase } }) => {
        const sessionId = params.sessionId;

        // First, get the tournament ID for redirection
        const { data: sessionData, error: sessionError } = await supabase
            .from('sessions')
            .select('tournament_id')
            .eq('id', sessionId)
            .single();

        if (sessionError) {
            console.error('Error getting session:', sessionError);
            return { success: false, error: sessionError.message };
        }

        const tournamentId = sessionData.tournament_id;

        // Delete all scorecards associated with this session
        const { error: scorecardsError } = await supabase
            .from('scorecards')
            .delete()
            .eq('session_id', sessionId);

        if (scorecardsError) {
            console.error('Error deleting scorecards:', scorecardsError);
            return { success: false, error: scorecardsError.message };
        }

        // Delete the session
        const { error: sessionDeleteError } = await supabase
            .from('sessions')
            .delete()
            .eq('id', sessionId);

        if (sessionDeleteError) {
            console.error('Error deleting session:', sessionDeleteError);
            return { success: false, error: sessionDeleteError.message };
        }

        // Redirect to the tournament page if this was a tournament session,
        // otherwise redirect to the home page
        if (tournamentId) {
            throw redirect(303, `/tournament/${tournamentId}`);
        } else {
            throw redirect(303, '/');
        }
    }
};
