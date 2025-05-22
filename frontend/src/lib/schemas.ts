import { z } from 'zod';

export const tournamentSchema = z.object({
    name: z.string().min(1, 'Name ist erforderlich'),
    startDate: z.string().min(1, 'Startdatum ist erforderlich'),
    startTime: z.string().min(1, 'Startzeit ist erforderlich'),
    endDate: z.string().min(1, 'Enddatum ist erforderlich'),
    endTime: z.string().min(1, 'Endzeit ist erforderlich'),
    minParticipants: z.number().min(1, 'Mindestens 1 Teilnehmer'),
    holeCount: z.number().min(1, 'Mindestens 1 Loch.'),
    description: z.string().optional()
});
export type TournamentSchema = z.infer<typeof tournamentSchema>;