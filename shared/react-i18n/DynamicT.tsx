"use client"
import { useTeapot } from "./i18nContext";
import { DATA_TOKEN_ATTR } from "@devographics/i18n";
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
    values?: Record<string, any>,
    fallback?: string,
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
 * Do not use in your app,
 * use DynamicT
 * 
 * Keep code in sync with ServerT
 */
export function InternalT({
    token,
    values,
    fallback,
    mode,
    tag = "span",
    children,
    ...otherProps
}: TProps) {
    const { getMessage } = useTeapot()
    const message = getMessage(token, values, fallback)
    const Tag = tag // uppercase for JSX
    const wrapperProps = {
        [DATA_TOKEN_ATTR]: token,
        // @ts-ignore Weird error with Children due to different versions of React
        ...otherProps
    }

    if (message.tHtml) {
        return <span {...wrapperProps} dangerouslySetInnerHTML={{ __html: message.tHtml }} />
    }
    if (message.tClean) {
        return <span {...wrapperProps}>{message.tClean}</span>
    }
    const displayedValue = message.t
    let useFallbackChildren = !displayedValue && !!children
    if (useFallbackChildren) {
        wrapperProps["data-dg-fallback-children"] = true
    }
    return <span {...wrapperProps}>{displayedValue || children}</span>
    // having a wrapper element is mandatory to attach some metadata
    // helping live translation later on
}

/**
 * Translation component, for tokens that are not known ahead of time
 * This is typically used for low-level UI components
 * 
 * @example function MenuItem({menuToken}) { return <div><DynamicT token={menuToken} /></div> }
 * 
 * If the token is a string, or a token expression, 
 * you should instead rely on the `teapot` function
 * 
 * @example export const { T }
 * 
 * @deprecated Favour passing the rendered text from parent component instead,
 * so your UI component don't have to think about i18n,
 * In the parent, use the "teapot" function with token expressions 
 * @example function MenuItem({menuText}) { return <div>{menuText}</div> }
 * // define menuText from parent
 * 
 *
 */
export const DynamicT = InternalT