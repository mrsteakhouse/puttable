import type {PageServerLoad} from "./$types"
import * as backend from "$lib/server/backend"
import {error} from "@sveltejs/kit";

export const load: PageServerLoad = async ({params}) => {
    const response = await backend.getTournament(params.tournamentId);

    if (response.status === 404) {
        error(404, { message: "Tournament not found"});
    }

    return {
        tournament: await response.json()
    }
};