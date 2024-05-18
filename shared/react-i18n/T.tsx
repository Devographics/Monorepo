import { useI18n } from "@devographics/react-i18n";
import { TK_ATTR } from "./attributes";
import React from "react";

export type TProps = {
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
     * 
     * TODO: should we accept multiple tokens for fallback?
     */
    token: string,
    /**
     * Use the HTML instead of the default "t" value
     * TODO: not yet actually used, not sure of use cases at this point, need to check existing code
     */
    mode?: "clean" | "html",
    /**
     * Allow to setup a default translation in English
     * If used, attribute "data-dg-fallback-children=true" will be added
     */
    children?: React.ReactNode,
    ///** Switch between div and span */
    tag?: "div" | "span"
}
    // Approximation to allow other common props
    & React.HTMLProps<HTMLSpanElement> & React.HTMLProps<HTMLDivElement>

/**
 * TODO: we cannot yet inject translations into React world, see Astro version
 */
export function T({
    token,
    mode,
    tag = "span",
    children,
    ...otherProps
}: TProps) {
    const { getString } = useI18n()
    const value = getString(token)
    const Tag = tag // uppercase for JSX
    const displayedValue = value.t
    let useFallbackChildren = !displayedValue && !!children
    // having a wrapper element is mandatory to attach some metadata
    // helping live translation later on
    return <Tag {...{
        [TK_ATTR]: token,
        "data-dg-fallback-children": useFallbackChildren ? "true" : undefined
    }} {...otherProps}>{displayedValue || children}</Tag>
}
