import React from 'react'
import T from 'core/i18n/T'
import './MidpageResourceBlock.scss'
import { useI18n } from '@devographics/react-i18n'
import { Sponsoring } from './RecommendedResourcesBlock'
import Link from 'core/components/LocaleLink'
import { BlockVariantDefinition } from 'core/types'
import { trackClick } from 'core/helpers/trackClick'

export const MidpageResourceBlock = ({ block }: { block: BlockVariantDefinition }) => {
    const { variables } = block
    const { id, labelId, imageUrl, logoUrl, link } = variables
    const { getString } = useI18n()
    return (
        <div className={`midpage-resource-block ${id}`}>
            <a
                href={link}
                onClick={() => {
                    trackClick(`sponsor_logo_${id}`, { id })
                }}
            >
                <div className="midpage-resource-wrapper">
                    <div
                        className="midpage-resource-image"
                        style={{ 'background-image': `url(${imageUrl})` }}
                    />
                    <div className="midpage-resource-content">
                        <img className="midpage-resource-logo" src={logoUrl} />
                        <h2>
                            <T k={labelId} />
                        </h2>
                        <div className="midpage-resource-description">
                            <T k={`${labelId}.description`} md={true} />
                        </div>
                    </div>
                </div>
            </a>

            <Sponsoring className="Resources__sponsoring">
                <T k="sponsors.thanks" />{' '}
                <Link to="/support">
                    <T k="sponsors.learn_more" />
                </Link>
            </Sponsoring>
        </div>
    )
}

export default MidpageResourceBlock
