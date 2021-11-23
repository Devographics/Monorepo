import React from 'react'
import { useI18n } from 'core/i18n/i18nContext'
import track from './tracking'
import ShareLink from './ShareLink'
import { TwitterIcon } from 'core/icons'

const ShareTwitter = ({ text, trackingId }) => {
    const { translate } = useI18n()

    return (
        <ShareLink
            onClick={track('Twitter', trackingId)}
            media="twitter"
            href={`https://twitter.com/intent/tweet/?text=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={translate('share.twitter')}
        >
            <TwitterIcon labelId="share.twitter" />
        </ShareLink>
    )
}

export default ShareTwitter
