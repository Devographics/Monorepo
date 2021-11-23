import React from 'react'
import PropTypes from 'prop-types'
import { useI18n } from 'core/i18n/i18nContext'
import track from './tracking'
import ShareLink from './ShareLink'
import { FacebookIcon } from 'core/icons'

const ShareFacebook = ({ link, trackingId }) => {
    const { translate } = useI18n()

    return (
        <ShareLink
            onClick={track('Facebook', trackingId)}
            media="facebook"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={translate('share.facebook')}
        >
            <FacebookIcon labelId="share.facebook" />
        </ShareLink>
    )
}

ShareFacebook.propTypes = {
    link: PropTypes.string.isRequired,
    trackingId: PropTypes.string,
}

export default ShareFacebook
