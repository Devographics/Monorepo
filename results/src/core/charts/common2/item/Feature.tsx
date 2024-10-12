import React from 'react'
import { LabelProps } from './types'
import CodeExample from 'core/components/CodeExample'
import { ItemLinks } from './People'
import { Entity } from '@devographics/types'

export const FeatureModal = ({ entity }: LabelProps) => (
    <div>
        <h3
            className="item-name"
            dangerouslySetInnerHTML={{ __html: entity.nameHtml || entity.nameClean || '' }}
        />
        {entity.description && (
            <div
                className="item-description"
                dangerouslySetInnerHTML={{ __html: entity.descriptionHtml || entity.description }}
            />
        )}
        {entity.example && (
            <CodeExample code={entity.example.code} language={entity.example.language} />
        )}
        <ItemLinks entity={entity} />
        {entity.resources && <ResourceLinks resources={entity.resources} />}
    </div>
)

const ResourceLinks = ({ resources }: { resources: Entity['resources'] }) => {
    return (
        <ul className="item-resources">
            {resources?.map(({ url, title }) => (
                <li key={title}>
                    <a href={url}>{title}</a>
                </li>
            ))}
        </ul>
    )
}
