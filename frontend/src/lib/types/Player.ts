import {PlayerDto} from "$lib/dto";

export class Player {
    private readonly _id: number;
    private readonly _name: string;

    constructor(id: number, name: string) {
        this._id = id;
        this._name = name;
    }

    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    public static fromDto(dto: PlayerDto): Player {
        return new Player(dto.id, dto.name);
    }

    public toDto() : PlayerDto {
        return new PlayerDto(this.id, this.name);
    }
}