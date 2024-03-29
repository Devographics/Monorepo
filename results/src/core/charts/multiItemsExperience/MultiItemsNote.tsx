import { FeaturesOptions, Option, SimplifiedSentimentOptions } from '@devographics/types'
import T from 'core/i18n/T'
import React from 'react'

export const NoteContents = () => (
    <div className="multiexp-note">
        <h4>
            <T k="options.experience.title" />
        </h4>
        <ul>
            {Object.values(FeaturesOptions).map(id => (
                <OptionDescription key={id} id={id} i18nNamespace={'experience'} />
            ))}
        </ul>
        <h4>
            <T k="options.sentiment.title" />
        </h4>

        <ul>
            {Object.values(SimplifiedSentimentOptions).map(id => (
                <OptionDescription key={id} id={id} i18nNamespace={'sentiment'} />
            ))}
        </ul>
    </div>
)

const OptionDescription = ({ id, i18nNamespace }: { id: string; i18nNamespace: string }) => (
    <li>
        <strong>
            <T k={`options.${i18nNamespace}.${id}.short`} />
        </strong>
        : <T k={`options.${i18nNamespace}.${id}.description`} />
    </li>
)
