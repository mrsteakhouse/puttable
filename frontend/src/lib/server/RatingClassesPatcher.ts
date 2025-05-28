import type { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'lucide-svelte';
import type { RatingClass } from '$lib/global.types';

export const patchRatingClasses = async (supabase: SupabaseClient<Database>, ratingClasses: {
    name: string,
    id?: number
}[]): Promise<number[]> => {
    const { data, error } = await supabase
        .from('rating_classes')
        .select();

    if (error || !data) {
        console.error(error);
        return [];
    }

    if (ratingClasses.length === data.length) {
        return [];
    }

    const newRatingClasses: { name: string }[] = ratingClasses.filter(cls => {
        return !data.findLast(r => r.name.toLowerCase() === cls.name.toLowerCase());
    }).map(cls => {
        return { name: cls.name }
    });

    const { data: newClassesData, error: insertError } = await supabase
        .from('rating_classes')
        .insert(newRatingClasses)
        .select();

    if (insertError || !newClassesData) {
        console.error(error);
        return [];
    }

    return newClassesData.map((cls: RatingClass) => cls.id);
}

export const updateTournamentRatingClasses = async () => {

};