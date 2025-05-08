import  {type Player} from "$lib/types/Player";
import type {RoundDto} from "$lib/dto";
import {drawer} from "flowbite-svelte";

export class Round {
    private readonly _id: number;
    private readonly _score: Map<number, number[]>;
    private readonly _submissionDateTime: Date | null;

    constructor(id: number, score: Map<number, number[]>, submissionDateTime: Date | null) {
        this._id = id;
        this._score = score;
        this._submissionDateTime = submissionDateTime;
    }

    get id(): number {
        return this._id;
    }

    get score(): Map<number, number[]> {
        return this._score;
    }

    get submissionDateTime(): Date | null {
        return this._submissionDateTime;
    }

    public static fromDto(dto: RoundDto) {
        return new Round(dto.id, dto.scores, dto.submissionDateTime);
    }
}