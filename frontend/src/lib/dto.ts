export class PlayerDto {
    id: number;
    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}

export class RoundDto {
    id: number;
    scores: Map<number, number[]>;
    submissionDateTime: Date | null;

    constructor(id: number, scores: Map<number, number[]>, submissionDateTime: Date | null) {
        this.id = id;
        this.scores = scores;
        this.submissionDateTime = submissionDateTime;
    }
}

export class TournamentDto {
    id: number;
    name: string
    competitors: number[]
    rounds: number[]
    startDateTime: Date;
    endDateTime: Date;
    numberOfHoles: number;
    description: string;

    constructor(id: number, name: string, competitors: number[], rounds: number[], startDateTime: Date, endDateTime: Date, numberOfHoles: number, description: string) {
        this.id = id;
        this.name = name;
        this.competitors = competitors;
        this.rounds = rounds;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.numberOfHoles = numberOfHoles;
        this.description = description;
    }
}