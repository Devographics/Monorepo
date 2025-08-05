import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import T from 'core/i18n/T'
import { usePageContext } from 'core/helpers/pageContext'

const AboutBlock = () => {
    const { currentEdition } = usePageContext()

    return (
        <About>
            <T k={`about.content.${currentEdition.id}`} md={true} />
        </About>
    )
}

const About = styled.div`
    @media ${mq.large} {
        max-width: 700px;
        margin: 0 auto;
        margin-bottom: ${spacing(4)};
    }
`

export default AboutBlock
