import React, { useContext, FC } from 'react'
import { useI18n, I18nContext } from '../helpers/i18nContext'
// import ReactMarkdown from 'react-markdown'
// import rehypeRaw from 'rehype-raw'

const T: FC<{
    k: string
    t?: string
    values?: any
    md?: boolean
    html?: boolean
    useShort?: boolean
    fallback?: string
}> = ({ t: override, k, values, md = false, html = false, fallback, useShort = false }) => {
    const i18n = useI18n()
    const { getString } = i18n

    // accept override to just use provided string as translation result
    let translation = override

    const props = {
        'data-key': k,
        className: ''
    }
    const classNames = ['t']

    if (override) {
        classNames.push('t-override')
    } else {
        const translationObject = getString(k, { values }, fallback)

        if (translationObject.t) {
            translation = md ? translationObject.tHtml : translationObject.t
        } else {
            if (translationObject.fallback) {
                // a translation was found, but it's a fallback placeholder
                translation = md ? translationObject.tHtml : translationObject.t
                classNames.push('t-fallback')
            } else {
                // no translation was found
                translation = `[${translationObject.locale.id}] ${k}`
                classNames.push('t-missing')
            }
        }
    }

    props.className = classNames.join(' ')

    return md ? (
        <div {...props} dangerouslySetInnerHTML={{ __html: translation }} />
    ) : html ? (
        <span {...props} dangerouslySetInnerHTML={{ __html: translation }} />
    ) : (
        <span {...props}>{translation}</span>
    )
}

export default T
