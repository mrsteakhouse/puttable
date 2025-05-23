import type { TournamentDto } from '$lib/dto';
import type { LayoutServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { TOURNAMENT_VIEW } from '$lib/dependables';

export const load: LayoutServerLoad = async ({params, locals: {supabase}, depends}) => {
    const {data, error} = await supabase
        .from('tournaments')
        .select()
        .eq('id', params.tournamentId)
        .single();

    depends(TOURNAMENT_VIEW);

    if (error && !data) {
        fail(500, {message: error.message})
        return;
    }

    return {
        tournament: {
            id: data.id,
            name: data.name,
            startDateTime: data.start_date,
            endDateTime: data.end_date,
            numberOfHoles: data.number_of_holes,
            minimumCompetitorsPerSession: data.minimum_participants,
            description: data.description
        } as TournamentDto,
    }
}