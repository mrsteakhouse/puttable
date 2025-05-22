import type {Actions} from "./$types";

export const actions = {
    default: async ({request}) => {
        const data = request.formData();

        return {success: true}
    }
} satisfies Actions