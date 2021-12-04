import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import T from 'core/i18n/T'

const ConclusionBlock = () => {
    return (
        <Conclusion className="Conclusion">
            <Title>
                <T k="sections.conclusion.title" />
            </Title>
            <T k="sections.conclusion.description" md={true} />
        </Conclusion>
    )
}

const Title = styled.h2`
    font-size: ${fontSize('largest')};
`
const Conclusion = styled.div`
    @media ${mq.large} {
        max-width: 700px;
        margin: 0 auto;
        margin-bottom: ${spacing(4)};
    }
    .block__content {
        p:first-child {
            @media ${mq.mediumLarge} {
                max-width: 700px;
                font-size: $larger-font;
            }
        }
    }
`

export default ConclusionBlock
