import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize, secondaryFontMixin } from 'core/theme'
import T from 'core/i18n/T'
import CreditItem from 'core/blocks/other/CreditItem'
import config from 'Config/config.yml'

const ConclusionBlock = ({ block, data: entities }) => {
    console.log(block, entities)
    const entity = entities && entities.find(e => e.id === block.variables.author)
    if (!entity) {
        return null
    }
    return (
        <Conclusion className="Conclusion">
            <Heading>
                {/* <Title>
                    <T k="sections.conclusion.title" />
                </Title> */}
                <CreditItem
                    id={block.variables.author}
                    entity={entity}
                    labelId={`conclusion.${config.surveySlug}.bio`}
                />
            </Heading>
            <T k={`conclusion.${config.surveySlug}`} md={true} />
        </Conclusion>
    )
}

const Heading = styled.div`
    margin-bottom: ${spacing(2)};
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
