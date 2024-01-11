import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useI18n } from '@devographics/react-i18n'
import track from './tracking'
import ShareLink from './ShareLink'
import { LinkIcon, CheckIcon } from 'core/icons'
import { copyTextToClipboard, removeDoubleSlashes } from 'core/helpers/utils'
import { usePageContext } from 'core/helpers/pageContext'

// const ShareURL = ({ link, trackingId, ...rest }) => {
//     const { translate } = useI18n()

//     return (
//         <ShareLink
//             onClick={track('Link', trackingId)}
//             media="link"
//             href={link}
//             target="_self"
//             labelId="share.url"
//             {...rest}
//         >
//             <LinkIcon labelId="share.url" />
//         </ShareLink>
//     )
// }

const ShareURL = ({ link, ...rest }: { link: string }) => {
    const pageContext = usePageContext()
    const { currentEdition } = pageContext
    const { resultsUrl } = currentEdition
    const url = removeDoubleSlashes(resultsUrl + link)
    const [isCopied, setIsCopied] = useState(false)

    // onClick handler function for the copy button
    const handleCopyClick = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        // Asynchronously call copyTextToClipboard
        await copyTextToClipboard(url)
        setIsCopied(true)
        setTimeout(() => {
            setIsCopied(false)
        }, 1500)
    }

    return (
        <ShareLink
            onClick={handleCopyClick}
            media="link"
            href={url}
            target="_self"
            labelId="share.url"
            {...rest}
        >
            <>
                <LinkIcon labelId="share.url" />
                {isCopied && <CheckIcon />}
            </>
        </ShareLink>
    )
}

ShareURL.propTypes = {
    subject: PropTypes.string,
    trackingId: PropTypes.string
}

export default ShareURL
