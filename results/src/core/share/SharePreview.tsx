import React from 'react'
import styled from 'styled-components'
import { stripMarkdown } from 'core/helpers/stripMarkdown'
import { stripHtml } from 'core/helpers/utils'
import T from 'core/i18n/T'
import { usePageContext } from 'core/helpers/pageContext'
import { getThemeColor } from 'core/theme_new/colors'

const Container = styled.div`
    border-radius: 3px;
    border: 1px solid var(--borderColor);
`

const Meta = styled.div`
    background: ${getThemeColor('background.invertedAlt')};
    color: ${getThemeColor('text.inverted')};
    padding: calc(var(--spacing) * 0.75);
`

const Title = styled.h4`
    font-size: var(--fontSizeMedium);
    margin-bottom: 0;
`

const Subtitle = styled.p`
    font-size: var(--fontSizeMedium);
    margin-bottom: calc(var(--spacing) * 0.2);
`

const Image = styled.img`
    display: block;
    width: 100%;
`

const Domain = styled.span`
    font-size: var(--fontSizeSmall);
`
const Legend = styled.div`
    font-size: var(--fontSizeSmall);
    text-align: center;
    margin-top: var(--halfSpacing);
    color: ${getThemeColor('text.alt')};
`

const getUrl = url => {
    try {
        return new URL(url)
    } catch (error) {
        return { hostname: '' }
    }
}

const SharePreview = ({ title, subtitle, image, link }) => {
    const context = usePageContext()
    const { hostname } = getUrl(context.currentEdition.resultsUrl)
    return (
        <div>
            <Container>
                <Image src={image} />
                <Meta>
                    <Title>{title}</Title>
                    {subtitle && <Subtitle>{stripMarkdown(stripHtml(subtitle))}</Subtitle>}
                    <Domain>{hostname}</Domain>
                </Meta>
            </Container>
            <Legend>
                <T k="share.preview" md={true} />
            </Legend>
        </div>
    )
}

export default SharePreview
