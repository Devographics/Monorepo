import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize, secondaryFontMixin } from 'core/theme'
import T from 'core/i18n/T'
import CreditItem from 'core/blocks/other/CreditItem'

const ConclusionBlock = ({ block }) => {
    return (
        <Conclusion className="Conclusion">
            <Heading>
                {/* <Title>
                    <T k="sections.conclusion.title" />
                </Title> */}
                <CreditItem id={block.author} labelId="conclusion.bio" />
            </Heading>
            <T k="sections.conclusion.description" md={true} />
        </Conclusion>
    )
}

const Heading = styled.div`
    margin-bottom: ${spacing()};
`

const Title = styled.h2`
    ${secondaryFontMixin}
    @media ${mq.small} {
        font-size: ${fontSize('larger')};
    }
    @media ${mq.mediumLarge} {
        font-size: ${fontSize('largest')};
    }
`

const Conclusion = styled.div`
    @media ${mq.large} {
        max-width: 700px;
        margin: 0 auto;
        margin-bottom: ${spacing(4)};
    }
    .first-line {
        @media ${mq.mediumLarge} {
            font-size: ${fontSize('largest')};
        }
    }
`

export default ConclusionBlock
