import React from 'react'
import PropTypes from 'prop-types'
import track from './tracking'
import ShareLink from './ShareLink'
import { LinkedInIcon } from '@devographics/icons'

const ShareLinkedIn = ({ link, title, summary = '', trackingId, ...rest }) => {
    return (
        <ShareLink
            onClick={track('LinkedIn', trackingId)}
            media="linkedin"
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                link
            )}&title=${title}&summary=${summary}`}
            target="_blank"
            rel="noopener noreferrer"
            labelId="share.linkedin"
            {...rest}
        >
            <LinkedInIcon labelId="share.linkedin" />
        </ShareLink>
    )
}

export default ShareLinkedIn
