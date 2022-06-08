import React from 'react'
import T from './T'
import { useI18n } from '../helpers/i18nContext'
import { Locale } from '../helpers/translator'

export default function LanguageSwitcher() {
    const { locales = [] } = useI18n()
    return (
        <div>
            <ul>
                {locales.map(locale => (
                    <Locale key={locale.id} {...locale} />
                ))}
            </ul>
        </div>
    )
}

const Locale = ({ id, label }: Locale) => <li>{label}</li>
