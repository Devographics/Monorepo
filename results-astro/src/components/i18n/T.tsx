import { useI18n } from "@devographics/react-i18n";
import { TK_ATTR } from "./attributes";
import type React from "react";

/**
 * TODO: we cannot yet inject translations into React world, see Astro version
 */
export function T({
    token,
    mode,
    ...otherProps
}:

    {
        /**
         * Token key
         * 
         * Not named "key" because confusion with React "key" which is reserved
         * 
         * - Can be a token expression with a contextual value like "{{surveyId}}.foobar"
         * (since they are resolved at build-time, the component doesn't care about the actual current surveyId)
         * 
         * - Cannot be a token expression with a range like "[[options]].foobar" 
         * (such a token doesn't make sense, it should be a specific value like "option_1.foobar")
         */
        token: string,
        /**
         * Use the HTML instead of the default "t" value
         * TODO: not yet actually used, not sure of use cases at this point, need to check existing code
         */
        mode?: "clean" | "html"
    } & React.HTMLProps<HTMLSpanElement>) {
    const { getString } = useI18n()
    const value = getString(token)
    return <span {...{ [TK_ATTR]: token }} {...otherProps}>{value.t}</span>
}
