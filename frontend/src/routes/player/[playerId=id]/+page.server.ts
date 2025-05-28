import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
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

    scorecards.forEach(scorecard => {
        const scores = scorecard.data as number[];
        scores.forEach(score => {
            if (score > 0) {
                totalScore += score;
                totalHolesPlayed++;
                if (score === 1) {
                    totalOnes++;
                }
            }
        });
    });

    // Calculate averages
    const averageScore = totalHolesPlayed > 0 ? (totalScore / totalHolesPlayed).toFixed(2) : '0.00';
    const onesRate = totalHolesPlayed > 0 ? ((totalOnes / totalHolesPlayed) * 100).toFixed(2) : '0.00';

    return {
        player,
        statistics: {
            averageScore,
            onesRate,
            totalHolesPlayed,
            totalOnes
        }
    };
};