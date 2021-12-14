import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize, color } from 'core/theme'
import { stripMarkdown } from 'core/helpers/stripMarkdown'
import { stripHtml } from 'core/helpers/stripHtml'
import config from 'Config/config.yml'
import T from 'core/i18n/T'

const Container = styled.div`
    border-radius: 3px;
    border: 1px solid ${({ theme }) => theme.colors.border};
`

const Meta = styled.div`
    background: ${props => props.theme.colors.backgroundInvertedAlt};
    color: ${props => props.theme.colors.textInverted};
    padding: ${spacing(0.75)};
`

const Title = styled.h4`
    font-size: ${fontSize('medium')};
    margin-bottom: ${spacing(0)};
`

const Subtitle = styled.p`
    font-size: ${fontSize('medium')};
    margin-bottom: ${spacing(0.2)};
`

const Image = styled.img`
    display: block;
    width: 100%;
`

const Domain = styled.span`
    font-size: ${fontSize('small')};
`
const Legend = styled.div`
    font-size: ${fontSize('small')};
    text-align: center;
    margin-top: ${spacing(0.5)};
    color: ${props => props.theme.colors.textAlt};
`

const SharePreview = ({ title, subtitle, image, link }) => {
    const { hostname } = new URL(config.siteUrl)
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
