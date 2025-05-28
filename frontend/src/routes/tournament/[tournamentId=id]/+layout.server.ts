import { RatingClassDto, SessionDto, type TournamentDto } from '$lib/dto';
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

    const sessionsResult = await supabase
        .from('sessions')
        .select(`
            id, 
            submitted_at, 
            scorecards(id, data, player:players(id, firstname, lastname))
        `)
        .eq('tournament_id', params.tournamentId);

    const sessions = sessionsResult.data?.map(session => {
        return {
            id: session.id,
            tournamentId: Number(params.tournamentId),
            tournamentName: data.name,
            holes: data.number_of_holes,
            submissionDateTime: session.submitted_at,
            scorecard: session.scorecards.map((scorecard: {
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
        } as SessionDto;
    }) || [];

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
        sessions: sessions
    }
}
