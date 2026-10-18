import React from 'react'
import Link from 'core/components/LocaleLink'
import T from 'core/i18n/T'
import { usePageContext } from 'core/helpers/pageContext'
import './SponsorsBlock.scss'
import { EditionMetadata } from '@devographics/types'

const getSponsorUrl = (url: string, edition: EditionMetadata) => {
    return `${url}?utm_source=${edition.surveyId}&utm_medium=website&utm_campaign=${edition.id}`
}

const SponsorsBlock = () => {
    const context = usePageContext()
    const { currentEdition } = context

    const sponsors = currentEdition?.sponsors
    return sponsors && sponsors.length > 0 ? (
        <>
            <div className="sponsors-block">
                <h3>
                    <T k="sponsors.our_partners" />
                </h3>
                <div className="sponsors-list">
                    {sponsors.map(({ name, imageUrl, url, id }) => {
                        const sponsorUrl = url.includes('utm')
                            ? url
                            : getSponsorUrl(url, currentEdition)
                        return (
                            <div className={`sponsors-item sponsors-item-${id}`} key={name}>
                                <div className="sponsors-logo">
                                    <a href={sponsorUrl} title={name}>
                                        <img src={imageUrl} alt={name} />
                                    </a>
                                </div>
                                <div className="sponsors-description">
                                    <T k={`sponsors.${id}.description`} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="sponsors-support">
                <Link to="/support">
                    <T k="sponsors.become_partner" />
                </Link>
            </div>
        </>
    ) : null
}

export default SponsorsBlock
