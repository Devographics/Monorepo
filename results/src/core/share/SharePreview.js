import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize, color } from 'core/theme'

const Container = styled.div`
    border-radius: 3px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: ${spacing()};
`

const Title = styled.h2``

const Subtitle = styled.h3``

const Image = styled.img``

const Domain = styled.span``

const SharePreview = ({ title, subtitle, image, link }) => {
    const { hostname } = new URL(link)
    return (
        <Container>
            <Title>{title}</Title>
            <Subtitle>{subtitle}</Subtitle>
            <Image src={image} />
            <Domain>{hostname}</Domain>
        </Container>
    )
}

export default SharePreview
