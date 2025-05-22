import {TournamentDto} from "$lib/dto";
import {DATETIME_WITH_TIMEZONE} from "$lib/constants";
import {fail} from "@sveltejs/kit";
import moment from "moment";
import {createClient, type SupabaseClient} from "@supabase/supabase-js";
import {createServerClient} from "@supabase/ssr";
import {PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL} from "$env/static/public";
import type {Database} from "$lib/database.types";

const supabase = createClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY);

export async function getTournament(id: string): Promise<TournamentDto | undefined> {
    const {data: tournament, error} = await supabase
        .from('tournaments')
        .select()
        .eq('id', Number(id))
        .single();
    if (error && !tournament) {
        fail(500, {message: error.message})
        return;
    }

    return new TournamentDto(
        tournament.id,
        tournament.name,
        moment(tournament.start_date),
        moment(tournament.end_date),
        tournament.number_of_holes,
        tournament.minimum_participants,
        tournament.description ?? ''
    );
}

export async function getAllTournaments(): Promise<TournamentDto[] | undefined> {
    const {data: tournaments, error} = await supabase
        .from('tournaments')
        .select()

    console.log(error?.details)
    console.log(tournaments)

    if (error && !tournaments) {
        fail(500, {message: error.message})
        return;
    }

    return tournaments.map(tournament =>
        new TournamentDto(
            tournament.id,
            tournament.name,
            moment(tournament.start_date),
            moment(tournament.end_date),
            tournament.number_of_holes,
            tournament.minimum_participants,
            tournament.description ?? ''
        ));
}

export async function postTournament(tournament: TournamentDto): Promise<void> {
    const {error} = await supabase
        .from('tournaments')
        .insert({
            name: tournament.name,
            start_date: tournament.startDateTime.format(DATETIME_WITH_TIMEZONE),
            end_date: tournament.endDateTime.format(DATETIME_WITH_TIMEZONE),
            number_of_holes: tournament.numberOfHoles,
            minimum_participants: tournament.minimumCompetitorsPerSession,
            description: tournament.description
        });

    if (error) {
        fail(500, {message: error.message})
    }
}

export async function patchTournament(tournament: TournamentDto): Promise<void> {
    const {error} = await supabase
        .from('tournaments')
        .update({
            name: tournament.name,
            start_date: tournament.startDateTime.format(DATETIME_WITH_TIMEZONE),
            end_date: tournament.endDateTime.format(DATETIME_WITH_TIMEZONE),
            number_of_holes: tournament.numberOfHoles,
            minimum_participants: tournament.minimumCompetitorsPerSession,
            description: tournament.description
        })
        .eq('id', tournament.id);

    if (error) {
        fail(500, {message: error.message})
    }
}