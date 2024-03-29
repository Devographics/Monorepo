import React from 'react'
import { LabelProps } from './types'
import CodeExample from 'core/components/CodeExample'
import { ItemLinks } from './People'

export const FeatureModal = ({ entity }: LabelProps) => (
    <div>
        {entity.nameHtml && (
            <h3
                className="item-name"
                dangerouslySetInnerHTML={{ __html: entity.nameHtml || entity.name }}
            />
        )}
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
    </div>
)
