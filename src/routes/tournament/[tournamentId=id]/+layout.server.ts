import { PlayerDto, RatingClassDto, SessionDto, type TournamentDto } from '$lib/dto';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({params, locals: {supabase}}) => {
    let {data, error: err} = await supabase
        .from('tournaments')
        .select()
        .eq('id', params.tournamentId)
        .single();

    if (err || !data) {
        error(404, {message: "Not Found"})
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
            scorecards(id, data, player:players(id, firstname, lastname, rating_class:rating_classes(name)))
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
                player: { id: number, firstname: string, lastname: string, rating_class: { name: string} }
            }) => {
                return {
                    id: scorecard.id,
                    data: scorecard.data,
                    player: {
                        id: scorecard.player.id,
                        firstName: scorecard.player.firstname,
                        lastName: scorecard.player.lastname,
                        ratingClass: scorecard.player.rating_class.name
                    } as PlayerDto
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
