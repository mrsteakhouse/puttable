import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { playerFormSchema, type PlayerFormSchema } from '$lib/schemas';
import { SessionDto } from '$lib/dto';
import { canAccessResource } from '$lib/rbac';
import { Action, Resource } from '$lib/permissions';
import * as Sentry from "@sentry/sveltekit";

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
    // Check if user is authenticated
    if (!await canAccessResource(supabase, Resource.Players, Number(params.playerId), Action.Read)) {
        throw redirect(303, '/player');
    }

    const playerId = parseInt(params.playerId);

    if (isNaN(playerId)) {
        throw error(400, 'Invalid player ID');
    }

    // Fetch player details
    const { data: player, error: playerError } = await supabase
        .from('players')
        .select(`
            id,
            firstname,
            lastname,
            rating_class_id,
            rating_classes (
                id,
                name
            )
        `)
        .eq('id', playerId)
        .single();

    if (playerError || !player) {
        throw error(404, 'Player not found');
    }

    // Fetch all scorecards for the player
    const { data: scorecards, error: scorecardsError } = await supabase
        .from('scorecards')
        .select(`
            id,
            data,
            session_id
        `)
        .eq('player_id', playerId);

    if (scorecardsError) {
        throw error(500, 'Failed to fetch scorecards');
    }

    // Calculate statistics
    let totalScore = 0;
    let totalHolesPlayed = 0;
    let totalOnes = 0;
    let totalScorecardsScore = 0;
    let validScorecards = 0;

    scorecards.forEach(scorecard => {
        const scores = scorecard.data as number[];
        let scorecardTotal = 0;
        let hasValidScores = false;

        scores.forEach(score => {
            if (score > 0) {
                totalScore += score;
                scorecardTotal += score;
                totalHolesPlayed++;
                hasValidScores = true;
                if (score === 1) {
                    totalOnes++;
                }
            }
        });

        if (hasValidScores) {
            totalScorecardsScore += scorecardTotal;
            validScorecards++;
        }
    });

    // Calculate averages
    const averageScore = totalHolesPlayed > 0 ? (totalScore / totalHolesPlayed).toFixed(2) : '0.00';
    const onesRate = totalHolesPlayed > 0 ? ((totalOnes / totalHolesPlayed) * 100).toFixed(2) : '0.00';
    const averageScorePerScorecard = validScorecards > 0 ? (totalScorecardsScore / validScorecards).toFixed(2) : '0.00';

    // Fetch all rating classes for the dropdown
    const { data: ratingClasses, error: ratingClassesError } = await supabase
        .from('rating_classes')
        .select();

    if (ratingClassesError) {
        throw error(500, 'Failed to fetch rating classes');
    }

    // Initialize the form with current player data
    const form = await superValidate<PlayerFormSchema>({
        firstName: player.firstname,
        lastName: player.lastname,
        ratingClassId: player.rating_class_id
    }, zod(playerFormSchema));

    // Fetch sessions the player has participated in
    const { data: playerSessions, error: sessionsError } = await supabase
        .from('scorecards')
        .select(`
            id,
            data,
            player_id,
            session:sessions(
                id,
                submitted_at,
                tournament:tournaments(
                    id,
                    name,
                    number_of_holes
                )
            )
        `)
        .eq('player_id', playerId)
        .order('session(submitted_at)', { ascending: false });

    if (sessionsError) {
        throw error(500, 'Failed to fetch player sessions');
    }

    // Group scorecards by session
    const sessionsMap = new Map();

    playerSessions.forEach(scorecard => {
        const sessionId = scorecard.session.id;

        if (!sessionsMap.has(sessionId)) {
            sessionsMap.set(sessionId, {
                id: sessionId,
                tournamentId: scorecard.session.tournament?.id ?? 0,
                tournamentName: scorecard.session.tournament?.name ?? '',
                holes: scorecard.session.tournament?.number_of_holes ?? 18,
                submissionDateTime: scorecard.session.submitted_at,
                scorecard: []
            });
        }

        const session = sessionsMap.get(sessionId);
        session.scorecard.push({
            id: scorecard.id,
            data: scorecard.data,
            player: {
                id: scorecard.player_id,
                firstName: player.firstname,
                lastName: player.lastname
            }
        });
    });

    // Convert map to array of SessionDto
    const sessions = Array.from(sessionsMap.values()).map(session => {
        return {
            id: session.id,
            tournamentId: session.tournamentId,
            tournamentName: session.tournamentName,
            holes: session.holes,
            submissionDateTime: session.submissionDateTime,
            scorecard: session.scorecard
        } as SessionDto;
    });

    return {
        player,
        statistics: {
            averageScore,
            onesRate,
            averageScorePerScorecard,
            totalHolesPlayed,
            totalOnes,
            validScorecards
        },
        ratingClasses,
        form,
        sessions
    };
};

export const actions: Actions = {
    updatePlayer: async ({ request, params, locals: { supabase } }) => {
        const playerId = parseInt(params.playerId);

        if (isNaN(playerId)) {
            error(404, { message: 'Invalid player ID' });
        }

        // Validate form data
        const form = await superValidate(request, zod(playerFormSchema));

        if (!form.valid) {
            return fail(400, { form });
        }

        // Update player
        const { error: updateError } = await supabase
            .from('players')
            .update({
                firstname: form.data.firstName,
                lastname: form.data.lastName,
                rating_class_id: form.data.ratingClassId
            })
            .eq('id', playerId);

        if (updateError) {
            Sentry.captureException(updateError);
            return fail(500, {
                form,
                message: updateError.message
            });
        }

        // Return success
        return { form, success: true };
    },

    deletePlayer: async ({ params, locals: { supabase } }) => {
        const playerId = parseInt(params.playerId);

        if (isNaN(playerId)) {
            error(400, { message: 'Invalid player ID' });
        }

        // Delete player
        const { error: deleteError } = await supabase
            .from('players')
            .delete()
            .eq('id', playerId);

        if (deleteError) {
            Sentry.captureException(deleteError);
            error(500, { message: deleteError.message });
        }

        // Redirect to player list
        redirect(303, '/player');
    }
};
