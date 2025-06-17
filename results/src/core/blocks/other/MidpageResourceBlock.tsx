import React from 'react'
import T from 'core/i18n/T'
import './MidpageResourceBlock.scss'
import { useI18n } from '@devographics/react-i18n'
import { Sponsoring } from './RecommendedResourcesBlock'
import Link from 'core/components/LocaleLink'

export const MidpageResourceBlock = ({
    id,
    labelId,
    imageUrl,
    logoUrl,
    link
}: {
    id: string
    labelId: string
    imageUrl: string
    logoUrl: string
    link: string
}) => {
    const { getString } = useI18n()
    return (
        <div className={`midpage-resource-block ${id}`}>
            <a href={link}>
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
