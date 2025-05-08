import type {PageServerLoad} from "./$types"

export const load: PageServerLoad = ({ params }) => {
    return {
        tournament: {
            id: params.tournamentId,
            name: "test tournament"
        }
    };
};