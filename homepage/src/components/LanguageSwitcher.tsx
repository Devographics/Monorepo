import React from 'react'
import T from './T'
import { useI18n } from '../helpers/i18nContext'
import { Locale } from '../helpers/translator'

export default function LanguageSwitcher({ locale, locales = [], canonicalUrl, survey }) {
    // const { locales = [] } = useI18n()
    const { href } = canonicalUrl
    return (
        <div>
            <h3>
                <T locale={locale} k="languages.available_languages" />
            </h3>
            <ul>
                {locales.map(locale => (
                    <Locale key={locale.id} url={href} currentLocale={locale} {...locale} />
                ))}
            </ul>
            <p>
                <a href="https://github.com/StateOfJS/locale-en-US">
                    <T locale={locale} k="languages.help_us_translate" />
                </a>
            </p>
        </div>
    )
}

const Locale = ({
    id,
    label,
    url,
    currentLocale
}: Locale & { url: string; currentLocale: Locale }) => (
    <li>
        <a href={url.replace(currentLocale.id, id)}>{label}</a>
    </li>
)
