import React from 'react'
import PropTypes from 'prop-types'
import { useI18n } from '@devographics/react-i18n'
import track from './tracking'
import ShareLink from './ShareLink'
import { FacebookIcon } from '@devographics/icons'

const ShareFacebook = ({ link, trackingId, ...rest }) => {
    const { translate } = useI18n()

    return (
        <ShareLink
            onClick={track('Facebook', trackingId)}
            media="facebook"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`}
            target="_blank"
            rel="noopener noreferrer"
            labelId="share.facebook"
            {...rest}
        >
            <FacebookIcon labelId="share.facebook" />
        </ShareLink>
    )
}

export default ShareFacebook
