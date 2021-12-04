import React from 'react'
import { useI18n } from 'core/i18n/i18nContext'
import track from './tracking'
import ShareLink from './ShareLink'
import { ImageIcon } from 'core/icons'

const ShareImage = ({ trackingId, url }) => {
    const { translate } = useI18n()

    return (
        <ShareLink
            onClick={track('Image', trackingId)}
            media="image"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={translate('share.image')}
        >
            <ImageIcon labelId="share.image" />
        </ShareLink>
    )
}

export default ShareImage
