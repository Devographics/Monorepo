import React from 'react'
import PropTypes from 'prop-types'
import { useI18n } from 'core/i18n/i18nContext'
import track from './tracking'
import ShareLink from './ShareLink'
import { LinkedInIcon } from 'core/icons'

const ShareLinkedIn = ({ link, title, summary = '', trackingId }) => {
    const { translate } = useI18n()

    return (
        <ShareLink
            onClick={track('LinkedIn', trackingId)}
            media="linkedin"
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                link
            )}&title=${title}&summary=${summary}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={translate('share.linkedin')}
        >
            <LinkedInIcon labelId="share.linkedin" />
        </ShareLink>
    )
}

ShareLinkedIn.propTypes = {
    link: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    summary: PropTypes.string,
    trackingId: PropTypes.string,
}

export default ShareLinkedIn
