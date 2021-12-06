import React from 'react'
import styled from 'styled-components'
import ShareTwitter from './ShareTwitter'
import ShareEmail from './ShareEmail'
import ShareFacebook from './ShareFacebook'
import ShareLinkedIn from './ShareLinkedIn'
import { useI18n } from 'core/i18n/i18nContext'
import config from 'Config/config.yml'

const { hashtag, year, siteTitle, siteUrl } = config

const ShareSite = () => {
    const { translate } = useI18n()

    const options = { values: { hashtag, year, siteTitle, link: siteUrl } }
    const title = translate('share.site.title', options)
    const twitterText = translate('share.site.twitter_text', options)
    const subject = translate('share.site.subject', options)
    const body = translate('share.site.body', options)

    return (
        <Container className="ShareSite">
            <ShareTwitter text={twitterText} />
            <ShareFacebook link={siteUrl} />
            <ShareLinkedIn link={siteUrl} title={title} />
            <ShareEmail subject={subject} body={body} />
        </Container>
    )
}

const Container = styled.div`
    border-top: ${(props) => props.theme.separationBorder};
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    position: relative;
    z-index: 1;
`

export default ShareSite
