import type { PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import type { TournamentDto } from '$lib/dto';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
    const { data, error } = await supabase.from('tournaments').select();

    if (error && !data) {
        fail(500, { message: error.message })
        return;
    }

    const mappedTournaments = data.map((tournament): TournamentDto => {
        return {
            id: tournament.id,
            name: tournament.name,
            startDateTime: tournament.start_date,
            endDateTime: tournament.end_date,
            numberOfHoles: tournament.number_of_holes,
            minimumCompetitorsPerSession: tournament.minimum_participants,
            description: tournament.description ?? ''
        }
    });

    return {
        tournaments: mappedTournaments ?? [],
    }
}