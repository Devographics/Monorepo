"use client"
import { useTeapot } from "./i18nContext";
import { DATA_FALLBACK_CHILDREN_ATTR, DATA_MISSING_ATTR, DATA_TOKEN_ATTR } from "@devographics/i18n";
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
    /**
     * Fallback string
     * If you need a React component as fallback, use "children" instead
     */
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
    //const Tag = tag // uppercase for JSX
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
    if (message.missing) {
        // Try to use children value as fallback
        if (fallback && children) {
            console.warn(`Ambiguous fallback for token ${token}. Use either "fallback" props or React "children", but not both. Will use "fallback" prop.`)
            wrapperProps[DATA_MISSING_ATTR] = true
            return <span {...wrapperProps}> {message.t}</span >
        } else if (children) {
            wrapperProps[DATA_MISSING_ATTR] = true
            wrapperProps[DATA_FALLBACK_CHILDREN_ATTR] = true
            return <span {...wrapperProps}>{children}</span >
        } else {
            // "getMessage" already put "fallback" into "t" for us
            return <span {...wrapperProps}>{message.t}</span >
        }
    }
    return <span {...wrapperProps}>{message.t}</span>
    // having a wrapper element is mandatory to attach some metadata
    // helping live translation later on
}

/**
 * Translation component, for tokens that are not known ahead of time
 * This is typically used for low-level UI components
 * or generated UIs such as form based on a yaml file
 * 
 * @example function MenuItem({menuToken}) { return <div><DynamicT token={menuToken} /></div> }
 * 
 * Use only as a last resort for truely dynamic tokens
 * 
 * Favour passing the rendered text from parent component instead,
 * so your UI component don't have to think about i18n,
 * In the parent, use the "teapot" function with token expressions 
 * @example function MenuItem({menuText}) { return <div>{menuText}</div> }
 * // define menuText from parent
 * 
 *
 */
export const DynamicT = InternalT