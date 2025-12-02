import React from 'react'
import { useI18n } from '@devographics/react-i18n'
import track from './tracking'
import ShareLink from './ShareLink'
import { ImageIcon } from '@devographics/icons'

const ShareImage = ({ trackingId, url, ...rest }) => {
    const { translate } = useI18n()

    return (
        <ShareLink
            onClick={track('Image', trackingId)}
            media="image"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            labelId="share.image"
            {...rest}
        >
            <ImageIcon labelId="share.image" />
        </ShareLink>
    )
}

export default ShareImage
