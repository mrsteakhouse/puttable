import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { canAccessResource, hasPermission } from '$lib/rbac';
import { Action, Resource } from '$lib/permissions';

export const load: PageServerLoad = async ({ locals: {supabase} }) => {
    if (!await hasPermission(supabase, Resource.Tournaments, Action.Read)) {
        throw redirect(303, '/');
    }
}

export const actions: Actions = {
    deleteTournament: async ({ params, locals: { supabase } }) => {
        const tournamentId = params.tournamentId;

        // First, delete all sessions associated with this tournament
        // This will cascade delete scorecards due to foreign key constraints
        const { error: sessionsError } = await supabase
            .from('sessions')
            .delete()
            .eq('tournament_id', tournamentId);

        if (sessionsError) {
            console.error('Error deleting sessions:', sessionsError);
            return { success: false, error: sessionsError.message };
        }

        // Delete rating classes associations
        const { error: ratingClassesError } = await supabase
            .from('rating_classes_to_tournaments')
            .delete()
            .eq('tournament_id', tournamentId);

        if (ratingClassesError) {
            console.error('Error deleting rating classes associations:', ratingClassesError);
            return { success: false, error: ratingClassesError.message };
        }

        // Finally, delete the tournament
        const { error: tournamentError } = await supabase
            .from('tournaments')
            .delete()
            .eq('id', tournamentId);

        if (tournamentError) {
            console.error('Error deleting tournament:', tournamentError);
            return { success: false, error: tournamentError.message };
        }

        // Redirect to the tournaments list page
        throw redirect(303, '/');
    }
};