import React from 'react'
import styled from 'styled-components'
import { useI18n } from 'core/i18n/i18nContext'
import { getBlockMeta } from 'core/helpers/blockHelpers'
import { usePageContext } from 'core/helpers/pageContext'
import { mq, spacing } from 'core/theme'
import T from 'core/i18n/T'

import SharePreview from 'core/share/SharePreview'
import ShareTwitter from 'core/share/ShareTwitter'
import ShareLinkedIn from 'core/share/ShareLinkedIn'
import ShareFacebook from 'core/share/ShareFacebook'
import ShareEmail from 'core/share/ShareEmail'
import ShareImage from 'core/share/ShareImage'
import ShareURL from 'core/share/ShareURL'

const Share = styled.div`
    display: flex;
    flex-direction: column;
    gap:2rem;

    @media ${mq.mediumLarge} {
        display: grid;
        gap: 0;
        grid-template-columns: 500px 1fr;
    }
`

const ShareIcons = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    a:first-child{
        border-radius: 5px 5px 0 0;
    }
    a:last-child{
        border-radius: 0 0 5px 5px;
    }
`
const ShareOptions = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
`

const ShareOptionsHeading = styled.h4`
    margin-bottom: ${spacing(0.5)};
    text-align: center;
`

const BlockShare = ({ isShareable, block, values, blockTitle }) => {
    const context = usePageContext()
    const { translate } = useI18n()

    const meta = getBlockMeta(block, context, translate, blockTitle)

    console.log(meta)

    const props = { ...meta, showLabel: true }

    return (
        <Share>
            <SharePreview
                title={meta.title}
                subtitle={meta.subtitle}
                image={meta.imageUrl}
                link={meta.link}
            />
            <ShareOptions>
                <ShareOptionsHeading>
                    <T k="share.options" />
                </ShareOptionsHeading>
                <ShareIcons>
                    <ShareURL {...props} />
                    <ShareTwitter {...props} />
                    <ShareFacebook {...props} />
                    <ShareLinkedIn {...props} />
                    <ShareEmail {...props} subject={meta.emailSubject} body={meta.emailBody} />
                    <ShareImage {...props} url={meta.imageUrl} />
                </ShareIcons>
            </ShareOptions>
        </Share>
    )
}

export default BlockShare
