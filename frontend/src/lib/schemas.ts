import { z } from 'zod';

export const playerSchema = z.object({
    firstName: z.string().min(1, "Vorname muss angegeben werden"),
    lastName: z.string().min(1, "Nachname muss angegeben werden"),
    id: z.number().optional()
})

export type PlayerSchema = z.infer<typeof sessionSchema>;

export const ratingClassSchema = z.object({
    name: z.string().min(1, 'Der Name ist erforderlich'),
    id: z.number().optional()
});
export type RatingClassSchema = z.infer<typeof ratingClassSchema>;

export const tournamentSchema = z.object({
    name: z.string().min(1, 'Name ist erforderlich'),
    startDate: z.string().min(1, 'Startdatum ist erforderlich'),
    startTime: z.string().min(1, 'Startzeit ist erforderlich'),
    endDate: z.string().min(1, 'Enddatum ist erforderlich'),
    endTime: z.string().min(1, 'Endzeit ist erforderlich'),
    minParticipants: z.number().min(1, 'Mindestens 1 Teilnehmer'),
    holeCount: z.number().min(1, 'Mindestens 1 Loch.'),
    description: z.string().optional(),
    ratingClasses: ratingClassSchema.array().min(1, 'Mindestens eine Wertungsklasse auswählen'),
});
export type TournamentSchema = z.infer<typeof tournamentSchema>;

export const sessionSchema = z.object({
    player: playerSchema.array().min(1, "Mindestens ein Spieler muss angegeben werden"),
    tournamentId: z.number().gt(0).optional(),
    tournamentHoles: z.number().gt(0).optional(),
});

export type SessionSchema = z.infer<typeof sessionSchema>;
