export class PlayerDto {
    id: number;
    name: string;
    ratingClass: string;

    constructor(id: number, name: string, ratingClass: string) {
        this.id = id;
        this.name = name;
        this.ratingClass = ratingClass;
    }
}

export class SessionDto {
    id: number;
    tournamentId: number;
    scoreCard: Map<number, number[]>;
    submissionDateTime: Date | null;

    constructor(id: number, tournamentId: number, scoreCard: Map<number, number[]>, submissionDateTime: Date | null) {
        this.id = id;
        this.tournamentId = tournamentId;
        this.scoreCard = scoreCard;
        this.submissionDateTime = submissionDateTime;
    }
}

export class TournamentDto {
    id: number;
    name: string;
    startDateTime: Date;
    endDateTime: Date;
    numberOfHoles: number;
    minimumCompetitorsPerSession: number;
    description: string;

    constructor(id: number, name: string, startDateTime: Date, endDateTime: Date, numberOfHoles: number, minimumCompetitorsPerSession: number, description: string) {
        this.id = id;
        this.name = name;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.numberOfHoles = numberOfHoles;
        this.minimumCompetitorsPerSession = minimumCompetitorsPerSession;
        this.description = description;
    }
}