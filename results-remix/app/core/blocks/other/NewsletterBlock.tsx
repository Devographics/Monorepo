import React from 'react'
import styled from 'styled-components'
import Newsletter from 'core/components/Newsletter'
import { useI18n } from '@devographics/react-i18n'
import { spacing } from 'core/theme'
import NewsletterMC from 'core/components/NewsletterMC'
import NewsletterPOST from 'core/components/NewsletterPOST'

const NewsletterBlock = () => {
    const { translate } = useI18n()

    return (
        <Container>
            {process.env.GATSBY_EMAIL_POST_URL ? (
                <NewsletterPOST />
            ) : process.env.GATSBY_MAILCHIMP_URL ? (
                <NewsletterMC />
            ) : (
                <Newsletter />
            )}
        </Container>
    )
}

const Container = styled.div`
    padding: ${spacing(1.5)};
    margin-bottom: ${spacing(2)};
    border: ${props => props.theme.separationBorder};
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
`

const Heading = styled.h3`
    margin-bottom: ${spacing(0.5)};
    font-size: ${props => props.theme.typography.size.larger};
`

const Description = styled.div`
    margin-bottom: ${spacing()};
`

export default NewsletterBlock
