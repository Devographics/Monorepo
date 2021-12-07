import React from 'react'
import { useI18n } from 'core/i18n/i18nContext'
// import ReactMarkdown from 'react-markdown'
// import rehypeRaw from 'rehype-raw'
import { useKeydownContext } from 'core/helpers/keydownContext'

const getGitHubSearchUrl = (k, localeId) =>
    `https://github.com/search?q=${k}+repo%3AStateOfJS%2Fstate-of-js-graphql-results-api+path%3A%2Fsrc%2Fi18n%2F${localeId}%2F+path%3A%2Fsrc%2Fi18n%2Fen-US%2F&type=Code&ref=advsearch&l=&l=`

const T = ({ t: override, k, values, md = false, html = false, fallback, useShort = false }) => {
    const { getString } = useI18n()
    const { modKeyDown } = useKeydownContext()

    // accept override to just use provided string as translation result
    let t = override
    const props = {
        'data-key': k,
    }
    const classNames = ['t']

    if (t) {
        classNames.push('t-override')
    } else {
        const tFullString = getString(k, { values }, fallback)
        const tShortString = getString(`${k}.short`, { values }, fallback)

        const tString = useShort && !tShortString.missing ? tShortString : tFullString

        const handleClick = (e) => {
            // note: `fallback` here denotes whether a string is itself a fallback for a missing string
            if (modKeyDown) {
                e.preventDefault()
                e.stopPropagation()
                window.open(getGitHubSearchUrl(k, tString.locale.id))
            }
        }

        if (!tString.t || tString.fallback) {
            props.onClick = handleClick
            props.title = 'Cmd/ctrl-click to add missing translation'
            classNames.push(modKeyDown ? 't-modkeydown' : 't-modkeyup')
            if (!tString.t) {
                // no translation was found
                t = `[${tString.locale.id}] ${k}`
                classNames.push('t-missing')
            } else if (tString.fallback) {
                // a translation was found, but it's a fallback placeholder
                t = tString.t
                classNames.push('t-fallback')
            }
        } else {
            t = md ? tString.tHtml : tString.t
        }
    }

    props.className = classNames.join(' ')
    
    //<ReactMarkdown rehypePlugins={[rehypeRaw]}>{t}</ReactMarkdown>

    return md ? (
        <div {...props} dangerouslySetInnerHTML={{ __html: t }} />
    ) : html ? (
        <span {...props} dangerouslySetInnerHTML={{ __html: t }} />
    ) : (
        <span {...props}>{t}</span>
    )
}

export default T
