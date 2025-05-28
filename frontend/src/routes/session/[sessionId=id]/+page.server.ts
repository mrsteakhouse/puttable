// src/routes/sessions/[id]/+page.server.ts
import type { PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { type SessionDto } from '$lib/dto';
import type { QueryData } from '@supabase/supabase-js';

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
    const scoreCardQuery = supabase
        .from('sessions')
        .select("id, submitted_at, tournament:tournaments(id, name, number_of_holes), scorecards(id, data, player:players(id, firstname, lastname))")
        .eq('id', params.sessionId)
        .single();

    type ScoreCardQuery = QueryData<typeof scoreCardQuery>;

    const { data, error: sErr } = await scoreCardQuery;
    if (sErr || !data) fail(404, { message: 'Session nicht gefunden' });

    const typedData: ScoreCardQuery = data;

    const sessionData = {
        id: typedData.id,
        tournamentId: typedData.tournament.id,
        tournamentName: typedData.tournament.name,
        holes: typedData.tournament.number_of_holes,
        submissionDateTime: typedData.submitted_at,
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

    return { session: sessionData };
};
