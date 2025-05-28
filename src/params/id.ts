import type {ParamMatcher} from "@sveltejs/kit";

export const match = ((param: string) => {
    return !isNaN(Number(param));
}) satisfies ParamMatcher;