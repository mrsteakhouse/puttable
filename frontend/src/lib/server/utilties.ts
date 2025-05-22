import moment from 'moment';
import { DATETIME_WITH_TIMEZONE } from '$lib/constants';
import type { Tournament } from '$lib/global.types';

export const tournamentFormDataToDb = (formData: FormData): Tournament => {
    const startDateTime = moment(`${formData.get('startDate')}T${formData.get('startTime')}`).format(DATETIME_WITH_TIMEZONE);
    const endDateTime = moment(`${formData.get('endDate')}T${formData.get('endTime')}`).format(DATETIME_WITH_TIMEZONE);
    return {
        name: formData.get('name'),
        start_date: startDateTime,
        end_date: endDateTime,
        number_of_holes: Number(formData.get('holeCount')),
        minimum_participants: Number(formData.get('minParticipants')),
        description: formData.get('description'),
    } as Tournament;
}