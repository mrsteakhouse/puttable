export class PlayerDto {
    id: number;
    firstName: string;
    lastName: string;
    ratingClass: string;

    constructor(id: number, firstName: string, lastName: string, ratingClass: string) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.ratingClass = ratingClass;
    }
}

export class ScoreCardDto {
    id: number;
    data: number[];
    player: PlayerDto;

    constructor(id: number, data: number[], player: PlayerDto) {
        this.id = id;
        this.data = data;
        this.player = player;
    }
}

export class SessionDto {
    id: number;
    tournamentId: number;
    scorecard: ScoreCardDto[];
    submissionDateTime: string | null;
    tournamentName: string;
    holes: number;

    constructor(id: number, tournamentId: number, scorecard: ScoreCardDto[], submissionDateTime: string | null, tournamentName: string, holes: number) {
        this.id = id;
        this.tournamentId = tournamentId;
        this.scorecard = scorecard;
        this.submissionDateTime = submissionDateTime;
        this.tournamentName = tournamentName;
        this.holes = holes;
    }
}

export class RatingClassDto {
    id: number;
    name: string;

    constructor(id: number, name: string, ratingClass: string) {
        this.id = id;
        this.name = name;
    }
}

export class TournamentDto {
    id: number;
    name: string;
    startDateTime: string;
    endDateTime: string;
    numberOfHoles: number;
    minimumCompetitorsPerSession: number;
    description: string;
    ratingClasses: RatingClassDto[];

    constructor(id: number,
                name: string,
                startDateTime: string,
                endDateTime: string,
                numberOfHoles: number,
                minimumCompetitorsPerSession: number,
                description: string,
                ratingClasses: RatingClassDto[]) {
        this.id = id;
        this.name = name;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.numberOfHoles = numberOfHoles;
        this.minimumCompetitorsPerSession = minimumCompetitorsPerSession;
        this.description = description;
        this.ratingClasses = ratingClasses;
    }
}