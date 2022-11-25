import React from 'react'
import { useI18n } from 'core/i18n/i18nContext'
// import ReactMarkdown from 'react-markdown'
// import rehypeRaw from 'rehype-raw'
import { useKeydownContext } from 'core/helpers/keydownContext'

const getGitHubSearchUrl = (k, localeId) =>
    `https://github.com/search?q=${k}+repo%3AStateOfJS%2Fstate-of-js-graphql-results-api+path%3A%2Fsrc%2Fi18n%2F${localeId}%2F+path%3A%2Fsrc%2Fi18n%2Fen-US%2F&type=Code&ref=advsearch&l=&l=`

const T = ({ t: override, k, values, md = false, html = false, isFallback, useShort = false }) => {
    const { getString } = useI18n()
    const { modKeyDown } = useKeydownContext()

    // accept override to just use provided string as translation result
    let translation = override

    const props = {
        'data-key': k
    }
    const classNames = ['t']

    if (override) {
        classNames.push('t-override')
    } else {
        const tFullString = getString(k, { values }, isFallback)
        const tShortString = getString(`${k}.short`, { values }, isFallback)

        const translationObject = useShort && !tShortString.missing ? tShortString : tFullString

        const handleClick = e => {
            // note: `fallback` here denotes whether a string is itself a fallback for a missing string
            if (modKeyDown) {
                e.preventDefault()
                e.stopPropagation()
                window.open(getGitHubSearchUrl(k, translationObject.locale.id))
            }
        }

        if (translationObject.t) {
            translation = md ? (translationObject.tHtml ||  translationObject.t) : translationObject.t
        } else {
            props.onClick = handleClick
            props.title = 'Cmd/ctrl-click to add missing translation'
            classNames.push(modKeyDown ? 't-modkeydown' : 't-modkeyup')
            if (translationObject.isFallback) {
                // a translation was found, but it's a fallback placeholder
                translation = md ? translationObject.tHtml : translationObject.t
                classNames.push('t-isFallback')
            } else {
                // no translation was found
                translation = `[${translationObject.locale.id}] ${k}`
                classNames.push('t-missing')
            }
        }
    }

    props.className = classNames.join(' ')

    //<ReactMarkdown rehypePlugins={[rehypeRaw]}>{t}</ReactMarkdown>

    return md ? (
        <div {...props} dangerouslySetInnerHTML={{ __html: translation }} />
    ) : html ? (
        <span {...props} dangerouslySetInnerHTML={{ __html: translation }} />
    ) : (
        <span {...props}>{translation}</span>
    )
}

export default T
