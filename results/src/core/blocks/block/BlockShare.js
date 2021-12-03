import React from 'react'
import styled from 'styled-components'

import { useI18n } from 'core/i18n/i18nContext'
import { getBlockMeta } from 'core/helpers/blockHelpers'
import { usePageContext } from 'core/helpers/pageContext'
import { mq, spacing } from 'core/theme'

import SharePreview from 'core/share/SharePreview'
import ShareTwitter from 'core/share/ShareTwitter'
import ShareLinkedIn from 'core/share/ShareLinkedIn'
import ShareFacebook from 'core/share/ShareFacebook'
import ShareEmail from 'core/share/ShareEmail'
import ShareImage from 'core/share/ShareImage'

const Share = styled.div`
  display:flex;
  flex-direction: column;

  @media ${mq.mediumLarge} {
    display: grid;
    grid-template-columns: 300px 1fr;
  }
`

const ShareIcons = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: ${spacing()};
    a {
        margin-right: ${spacing()};
        &:last-child {
            margin-right: ${0};
        }
    }
`

const BlockShare = ({ isShareable, block, values, blockTitle }) => {
    const context = usePageContext()
    const { translate } = useI18n()

    const meta = getBlockMeta(block, context, translate, blockTitle)

    return (
        <Share>
            <SharePreview
                title={meta.title}
                subtitle={meta.subtitle}
                image={meta.imageUrl}
                link={meta.link}
            />
            <ShareIcons>
                <ShareTwitter text={meta.twitterText} trackingId={meta.trackingId} />
                <ShareFacebook link={meta.link} trackingId={meta.trackingId} />
                <ShareLinkedIn link={meta.link} title={meta.title} trackingId={meta.trackingId} />
                <ShareEmail
                    subject={meta.emailSubject}
                    body={meta.emailBody}
                    trackingId={meta.trackingId}
                />
                <ShareImage trackingId={meta.trackingId} url={meta.imageUrl} />
            </ShareIcons>
        </Share>
    )
}

export default BlockShare
