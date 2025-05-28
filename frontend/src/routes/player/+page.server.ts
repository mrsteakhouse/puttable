import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { RatingClassDto } from '$lib/dto';

// Create a schema for the player creation form
const playerFormSchema = z.object({
    firstName: z.string().min(1, "Vorname muss angegeben werden"),
    lastName: z.string().min(1, "Nachname muss angegeben werden"),
    ratingClassId: z.number().min(1, "Wertungsklasse muss ausgewählt werden")
});

export type PlayerFormSchema = z.infer<typeof playerFormSchema>;

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
    // Fetch all players with their rating classes
    const { data: players, error: playersError } = await supabase
        .from('players')
        .select(`
            id,
            firstname,
            lastname,
            rating_class_id,
            rating_classes (
                id,
                name
            )
        `);

    if (playersError) {
        return fail(500, { message: playersError.message });
    }

    // Fetch all rating classes for the dropdown
    const { data: ratingClasses, error: ratingClassesError } = await supabase
        .from('rating_classes')
        .select();

    if (ratingClassesError) {
        return fail(500, { message: ratingClassesError.message });
    }

    // Format rating classes for the dropdown
    const formattedRatingClasses: RatingClassDto[] = ratingClasses.map(rc => ({
        id: rc.id,
        name: rc.name
    }));

    // Initialize the form
    const form = await superValidate<PlayerFormSchema>(zod(playerFormSchema));

    return {
        players,
        ratingClasses: formattedRatingClasses,
        form
    };
};

export const actions: Actions = {
    // New action for the CreatePlayerModal component
    createPlayer: async ({ request, locals: { supabase } }) => {
        // Validate form data
        const form = await superValidate(request, zod(playerFormSchema));

        if (!form.valid) {
            return fail(400, { form });
        }

        // Insert new player
        const { data, error } = await supabase
            .from('players')
            .insert({
                firstname: form.data.firstName,
                lastname: form.data.lastName,
                rating_class_id: form.data.ratingClassId
            })
            .select()
            .single();

        if (error) {
            return fail(500, {
                form,
                message: error.message
            });
        }

        // Return the created player data instead of redirecting
        return {
            form,
            player: {
                id: data.id,
                firstName: data.firstname,
                lastName: data.lastname
            }
        };
    }
};
