import React from 'react'
import styled from 'styled-components'
import ShareTwitter from './ShareTwitter'
import ShareEmail from './ShareEmail'
import ShareFacebook from './ShareFacebook'
import ShareLinkedIn from './ShareLinkedIn'
import { useI18n } from '@devographics/react-i18n'
import { usePageContext } from '../helpers/pageContext'
import { getSiteTitle } from '../helpers/pageHelpers'

const ShareSite = () => {
    const { translate } = useI18n()

    const pageContext = usePageContext()
    const { currentSurvey, currentEdition } = pageContext
    const { year, resultsUrl } = currentEdition
    const { hashtag } = currentSurvey
    const siteTitle = getSiteTitle({ pageContext })

    const options = { values: { hashtag, year, siteTitle, link: resultsUrl } }
    const title = translate('share.site.title', options)
    const twitterText = translate('share.site.twitter_text', options)
    const subject = translate('share.site.subject', options)
    const body = translate('share.site.body', options)

    return (
        <Container className="ShareSite">
            <ShareTwitter twitterText={twitterText} />
            <ShareFacebook link={resultsUrl} />
            <ShareLinkedIn link={resultsUrl} title={title} />
            <ShareEmail subject={subject} body={body} />
        </Container>
    )
}

const Container = styled.div`
    border-top: ${props => props.theme.separationBorder};
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    position: relative;
    z-index: 1;
`

export default ShareSite
