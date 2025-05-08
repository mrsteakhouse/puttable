import type {TournamentDto} from "$lib/dto";

export class Tournament {
    private readonly _id: number;
    private readonly _name: string;
    private readonly _startDateTime: Date;
    private readonly _endDateTime: Date;
    private readonly _competitors: number[];
    private readonly _numberOfHoles: number;
    private readonly _description: string;

    constructor(id: number, name: string, startDateTime: Date, endDateTime: Date, competitors: number[], numberOfHoles: number, description: string) {
        this._id = id;
        this._name = name;
        this._startDateTime = startDateTime;
        this._endDateTime = endDateTime;
        this._competitors = competitors;
        this._numberOfHoles = numberOfHoles;
        this._description = description;
    }

    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get startDateTime(): Date {
        return this._startDateTime;
    }

    get endDateTime(): Date {
        return this._endDateTime;
    }

    get competitors(): number[] {
        return this._competitors;
    }

    get numberOfHoles(): number {
        return this._numberOfHoles;
    }

    get description(): string {
        return this._description;
    }

    public static fromDto(dto: TournamentDto): Tournament {
        return new Tournament(
            dto.id,
            dto.name,
            dto.startDateTime,
            dto.endDateTime,
            dto.competitors,
            dto.numberOfHoles,
            dto.description
        );
    }
}