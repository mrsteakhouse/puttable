import {Tournament} from "$lib/types/Tournament";
import {PlayerDto, RoundDto, type TournamentDto} from "$lib/dto";
import {API_PREFIX, PLAYER_ENDPOINT, ROUND_ENDPOINT, TOURNAMENT_ENDPOINT} from "$lib/server/constants";
import {Player} from "$lib/types/Player";
import {Round} from "$lib/types/Round";

class backend {
    public async getAllTournaments(): Promise<Tournament[]> {
        const result = await fetch(API_PREFIX + TOURNAMENT_ENDPOINT);
        return result.json()
            .then((data: TournamentDto[]) => data.map(dto => Tournament.fromDto(dto)));
    }

    public async getTournamentById(id: number): Promise<Tournament> {
        const request = await fetch(API_PREFIX + TOURNAMENT_ENDPOINT + `/${id}`);
        return request.json()
            .then((data: TournamentDto) => Tournament.fromDto(data))
    }

    public async getAllPlayer(): Promise<Player[]> {
        const request = await fetch(API_PREFIX + PLAYER_ENDPOINT);
        return request.json()
            .then((data: PlayerDto[]) => data.map(dto => Player.fromDto(dto)));
    }

    public async getPlayer(...ids: number[]) {
        return this.getAllPlayer()
            .then(players => players.filter(player => player.id in ids))
    }

    public async getAllRounds() {
        const request = await fetch(API_PREFIX + ROUND_ENDPOINT);
        return request.json()
            .then((data: RoundDto[]) => data.map(dto => Round.fromDto(dto)));
    }

    public async postRound(data: RoundDto): Promise<number> {
        const request = await fetch(API_PREFIX + ROUND_ENDPOINT, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application-json"
            }
        });
        await request.json();
        return request.status;
    }

    public async postPlayer(data: PlayerDto): Promise<number> {
        const request = await fetch(API_PREFIX + PLAYER_ENDPOINT, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application-json"
            }
        });
        await request.json();
        return request.status;
    }
}