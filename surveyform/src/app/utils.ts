import { RscError } from "~/lib/rsc-error";

/**
 * Wrap a React server component
 * TODO: refactor to make this a RSC-only
 * ErrorBoundary ?
 * @param rsc 
 * @returns 
 */
export function WithErrorCatcher(rsc: any) {
    return async (...args: any) => {
        try {
            return await rsc(...args);
        } catch (err) {
            if (err instanceof RscError) {
                return err.render();
            }
            // uncatched error
            throw err;
        }
    };
}