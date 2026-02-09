// TODO: reuse T component from @devographics/react-i18n
import React from 'react'
import { useI18n } from '@devographics/react-i18n'
import { useKeydownContext } from 'core/helpers/keydownContext'

const getGitHubSearchUrl = (k: string, localeId = 'en') =>
    `https://github.com/search?q=${k}+repo%3AStateOfJS%2Fstate-of-js-graphql-results-api+path%3A%2Fsrc%2Fi18n%2F${
        localeId || 'en'
    }%2F+path%3A%2Fsrc%2Fi18n%2Fen-US%2F&type=Code&ref=advsearch&l=&l=`

interface TProps {
    override?: string
    k?: string
    keysList?: Array<string | undefined>
    values?: any
    md?: boolean
    html?: boolean
    isFallback?: boolean
    useShort?: boolean
    element?: string
    fallback?: string
}

export const T = ({
    override,
    k,
    keysList,
    values,
    md = false,
    html = false,
    fallback,
    isFallback = false,
    useShort = false,
    element
}: TProps) => {
    const { getString, getFallbacks } = useI18n()
    const { modKeyDown } = useKeydownContext()

    // accept override to just use provided string as translation result
    let translation = override

    const props: any = {
        'data-key': k
    }

    const classNames = ['t']

    if (override) {
        classNames.push('t-override')
    } else {
        let tFullString, tShortString
        // FIXME: expects a fallback value, not "isFallback boolean"

        if (keysList) {
            tFullString = getFallbacks(keysList, values)
            tShortString = tFullString
        } else {
            tFullString = getString(k, { values }, fallback) //isFallback)
            tShortString = getString(`${k}.short`, { values }, fallback) // isFallback)
        }

        const translationObject =
            useShort && tShortString && !tShortString.missing ? tShortString : tFullString

        if (!translationObject) {
            throw new Error(
                `no translationObject object returned for key(s) ${k ?? keysList?.join()}`
            )
        }

        props['data-key'] = translationObject.key

        const handleClick = (e: React.MouseEvent<any>) => {
            // note: `fallback` here denotes whether a string is itself a fallback for a missing string
            if (modKeyDown) {
                e.preventDefault()
                e.stopPropagation()
                window.open(getGitHubSearchUrl(k, translationObject.locale.id))
            }
        }

        if (translationObject.t) {
            translation = md ? translationObject.tHtml || translationObject.t : translationObject.t
        } else {
            props.onClick = handleClick
            props.title = 'Cmd/ctrl-click to add missing translation'
            classNames.push(modKeyDown ? 't-modkeydown' : 't-modkeyup')
            // FIXME we don't have isFallback anymore
            if (translationObject.isFallback) {
                // a translation was found, but it's a fallback placeholder
                translation = md ? translationObject.tHtml : translationObject.t
                classNames.push('t-isFallback')
            } else if (fallback) {
                translation = fallback
                classNames.push('t-providedFallback')
            } else {
                // no translation was found
                translation = `[${translationObject.locale.id}] ${k}`
                classNames.push('t-missing')
            }
        }
    }

    props.className = classNames.join(' ')

    const isHtml = md || html
    const Element = element ? element : isHtml ? 'div' : 'span'

    return isHtml ? (
        <Element {...props} dangerouslySetInnerHTML={{ __html: translation }} />
    ) : (
        <Element {...props}>{translation}</Element>
    )
}

export default T
