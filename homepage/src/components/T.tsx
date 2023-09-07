import React, { useContext, FC } from 'react'
// import { useI18n, i18nContext } from '../helpers/i18nContext'
// import ReactMarkdown from 'react-markdown'
// import rehypeRaw from 'rehype-raw'
import { getStringTranslator, Locale } from '../helpers/translator'

import { dataFetcher } from '../helpers/data'

export interface Tproperties {
    k: string
    t?: string
    values?: any
    md?: boolean
    html?: boolean
    useShort?: boolean
    fallback?: string
    locale?: Locale
}

export default function T({
    t: override,
    k,
    values,
    md = false,
    html = false,
    fallback,
    useShort = false,
    locale
}: Tproperties) {
    // const data = await dataFetcher.getData()
    // props version
    const getString = getStringTranslator(locale)

    // context version
    // const i18n = useI18n()
    // console.log(i18n)
    // const {getString} = i18n

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
        <p {...props} dangerouslySetInnerHTML={{ __html: translation }} />
    ) : html ? (
        <span {...props} dangerouslySetInnerHTML={{ __html: translation }} />
    ) : (
        <span {...props}>{translation}</span>
    )
}
