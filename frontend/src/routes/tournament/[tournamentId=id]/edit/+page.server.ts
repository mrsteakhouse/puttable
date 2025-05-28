import { type Actions, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate, type SuperValidated } from 'sveltekit-superforms';
import { type TournamentSchema, tournamentSchema } from '$lib/schemas';
import { zod } from 'sveltekit-superforms/adapters';
import moment from 'moment/moment';
import { DATETIME_WITH_TIMEZONE, PARSE_DATETIME_FORMAT } from '$lib/constants';
import type { TournamentDto } from '$lib/dto';
import { patchRatingClasses } from '$lib/server/RatingClassesPatcher';

export const load: PageServerLoad = async ({ parent }) => {
    const { tournament: data } = await parent();
    const tournament = data as TournamentDto
    if (!tournament) {
        fail(404, { message: "Turnier nicht gefunden" });
    }

    const form: SuperValidated<TournamentSchema> = await superValidate({
        name: tournament.name,
        startDate: tournament.startDateTime !== '' ? moment(tournament.startDateTime).format("YYYY-MM-DD") : '',
        startTime: tournament.startDateTime !== '' ? moment(tournament.startDateTime).format("HH:mm") : '',
        endDate: tournament.startDateTime !== '' ? moment(tournament.endDateTime).format("YYYY-MM-DD") : '',
        endTime: tournament.startDateTime !== '' ? moment(tournament.endDateTime).format("HH:mm") : '',
        minParticipants: tournament.minimumCompetitorsPerSession,
        holeCount: tournament.numberOfHoles,
        description: tournament.description,
        ratingClasses: tournament.ratingClasses
    } as TournamentSchema, zod(tournamentSchema));

    return { form };
}

export const actions = {
    default: async ({request, locals: {supabase}, params}) => {
        const form = await superValidate(request, zod(tournamentSchema))

        if (!form.valid) {
            return fail(400, { form });
        }

        const newRatingClassIds = await patchRatingClasses(supabase, form.data.ratingClasses);

        const { error } = await supabase
            .from('tournaments')
            .update({
                name: form.data.name,
                start_date: moment(`${form.data.startDate}T${form.data.startTime}Z`).format(DATETIME_WITH_TIMEZONE),
                end_date: moment(`${form.data.endDate}T${form.data.endTime}Z`).format(DATETIME_WITH_TIMEZONE),
                number_of_holes: form.data.holeCount,
                minimum_participants: form.data.minParticipants,
                description: form.data.description,
            })
            .eq('id', params.tournamentId);

        if (error) {
            console.error(error);
            return fail(400, { form });
        }



        redirect(303, `/tournament/${params.tournamentId}`);
    }
} satisfies Actions