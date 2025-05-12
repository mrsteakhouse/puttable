import type {PageServerLoad} from "./$types";
import * as backend from "$lib/server/backend"

export const load: PageServerLoad = async ({params}) => {
    const response = await backend.getAllTournaments();

    return {
        tournaments: await response.json()
    }
}