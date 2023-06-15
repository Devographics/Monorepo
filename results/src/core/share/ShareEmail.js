import React from 'react'
import PropTypes from 'prop-types'
import { useI18n } from 'core/i18n/i18nContext'
import track from './tracking'
import ShareLink from './ShareLink'
import { EmailIcon } from 'core/icons'

const ShareEmail = ({ subject, body, trackingId, ...rest }) => {
    const { translate } = useI18n()

    return (
        <ShareLink
            onClick={track('Email', trackingId)}
            media="email"
            href={`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
            target="_self"
            labelId="share.email"
            {...rest}
        >
            <EmailIcon labelId="share.email" />
        </ShareLink>
    )
}

ShareEmail.propTypes = {
    subject: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    trackingId: PropTypes.string
}

export default ShareEmail
