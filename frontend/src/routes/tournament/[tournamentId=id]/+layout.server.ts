import { RatingClassDto, type TournamentDto } from '$lib/dto';
import type { LayoutServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { TOURNAMENT_VIEW } from '$lib/dependables';

export const load: LayoutServerLoad = async ({params, locals: {supabase}, depends}) => {
    depends(TOURNAMENT_VIEW);

    let {data, error} = await supabase
        .from('tournaments')
        .select()
        .eq('id', params.tournamentId)
        .single();

    if (error && !data) {
        fail(500, {message: error.message})
        return;
    }

    const ratingClassesResult = await supabase
        .from('rating_classes')
        .select();

    const selectedRatingClassesResult = await supabase
        .from('rating_classes')
        .select(`
            id,
            name,
            tournaments!inner (
                id
            )
        `)
        .eq('tournaments.id', params.tournamentId);

    return {
        tournament: {
            id: data.id,
            name: data.name,
            startDateTime: data.start_date,
            endDateTime: data.end_date,
            numberOfHoles: data.number_of_holes,
            minimumCompetitorsPerSession: data.minimum_participants,
            description: data.description ?? '',
            ratingClasses: selectedRatingClassesResult.data as RatingClassDto[]
        } as TournamentDto,
        availableRatingClasses: ratingClassesResult.data as RatingClassDto[],
    }
}