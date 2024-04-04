import React from 'react'
import { LabelProps } from './types'
import { ItemLinks } from './People'

export const LibraryModal = ({ entity }: LabelProps) => (
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
        <ItemLinks entity={entity} />
    </div>
)
