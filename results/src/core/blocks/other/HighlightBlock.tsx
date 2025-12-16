import T from 'core/i18n/T'
import { BlockVariantDefinition } from 'core/types'
import React from 'react'
import './HighlightBlock.scss'
import { Entity } from '@devographics/types'
import { LightbulbIcon, LightbulbIconOn, QuestionIcon } from '@devographics/icons'
import { entityComponents } from 'core/charts/common2/item'
import { ItemLinks } from 'core/charts/common2/item/People'
import { ResourceLinks, WebFeatureData } from 'core/charts/common2/item/Feature'

export const HighlightBlock = ({
    block,
    data: entity
}: {
    block: BlockVariantDefinition
    data: Entity
}) => {
    const { variables } = block
    const InfoComponent = entityComponents[entity.entityType].modal
    const { id } = entity
    return (
        <div className="highlight-block">
            <h4 className="highlight-block-description">
                <T k="highlight.description" />
            </h4>
            <div className="highlight-block-wrapper inverted">
                <div className="highlight-block-icon">
                    <LightbulbIconOn />
                </div>
                <div className="highlight-block-inner">
                    <div className="highlight-block-heading">
                        <h2>
                            <T k="highlight.heading.feature" />{' '}
                            <strong
                                dangerouslySetInnerHTML={{ __html: entity.nameHtml || entity.name }}
                            />
                            {/* <QuestionIcon size="petite" label={<T k="highlight.description" />} /> */}
                        </h2>
                        {/* <InfoComponent entity={entity} /> */}
                    </div>
                    <div className="highlight-block-info">
                        <div className="highlight-block-contents">
                            <div className="highlight-block-text">
                                <T k={`highlight.${id}.html2025`} md={true} />
                            </div>
                            {entity.webFeature && <WebFeatureData entity={entity} />}
                        </div>
                    </div>
                </div>
                <div className="highlight-block-resources">
                    <h3>
                        <T k="highlight.resources" />
                    </h3>
                    <ItemLinks entity={entity} />
                    {entity.resources && <ResourceLinks resources={entity.resources} />}
                </div>
            </div>
        </div>
    )
}

export default HighlightBlock
