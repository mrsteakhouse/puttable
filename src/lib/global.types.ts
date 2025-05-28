import type {Tables} from "./database.types";

export type Tournament = Tables<'tournaments'>;
export type Player = Tables<"players">;
export type RatingClass = Tables<"rating_classes">
export type Sessions = Tables<"sessions">;
export type Scorecard = Tables<"scorecards">;
export type RatingClassToTournament = Tables<"rating_classes_to_tournaments">;