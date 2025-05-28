import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { playerFormSchema, type PlayerFormSchema } from '$lib/schemas';

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

    return {
        player,
        statistics: {
            averageScore,
            onesRate,
            totalHolesPlayed,
            totalOnes
        },
        ratingClasses,
        form
    };
};

export const actions: Actions = {
    updatePlayer: async ({ request, params, locals: { supabase } }) => {
        const playerId = parseInt(params.playerId);

        if (isNaN(playerId)) {
            return fail(400, { message: 'Invalid player ID' });
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
            return fail(400, { message: 'Invalid player ID' });
        }

        // Delete player
        const { error: deleteError } = await supabase
            .from('players')
            .delete()
            .eq('id', playerId);

        if (deleteError) {
            return fail(500, { message: deleteError.message });
        }

        // Redirect to player list
        redirect(303, '/player');
    }
};
