import React from 'react'
import PropTypes from 'prop-types'
import { useI18n } from 'core/i18n/i18nContext'
import track from './tracking'
import ShareLink from './ShareLink'
import { LinkIcon } from 'core/icons'

const ShareURL = ({ link, trackingId, ...rest }) => {
    const { translate } = useI18n()

    return (
        <ShareLink
            onClick={track('Link', trackingId)}
            media="link"
            href={link}
            target="_self"
            labelId="share.url"
            {...rest}
        >
            <LinkIcon labelId="share.url" />
        </ShareLink>
    )
}

ShareURL.propTypes = {
    subject: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    trackingId: PropTypes.string,
}

export default ShareURL
