import React from 'react'
import { useI18n } from '@devographics/react-i18n'
import track from './tracking'
import ShareLink from './ShareLink'
import { TwitterIcon } from 'core/icons'

const ShareTwitter = ({ twitterText, twitterLink, trackingId, ...rest }) => {
    const { translate } = useI18n()

    return (
        <ShareLink
            onClick={track('Twitter', trackingId)}
            media="twitter"
            href={`https://twitter.com/intent/tweet/?url=${encodeURIComponent(
                twitterLink
            )}&text=${encodeURIComponent(twitterText)}`}
            target="_blank"
            rel="noopener noreferrer"
            labelId="share.twitter"
            {...rest}
        >
            <TwitterIcon labelId="share.twitter" />
        </ShareLink>
    )
}

export default ShareTwitter
