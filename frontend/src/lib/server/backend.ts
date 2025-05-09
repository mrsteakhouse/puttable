import type {TournamentDto} from "$lib/dto";
import {env} from "$env/dynamic/private"
import {API_PREFIX, TOURNAMENT_ENDPOINT} from "$lib/constants";

export async function getTournament(id: string): Promise<Response> {
    return await fetch(env.BACKEND_URL + API_PREFIX + TOURNAMENT_ENDPOINT + `/${id}`);
}