import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize, secondaryFontMixin } from 'core/theme'
import T from 'core/i18n/T'
import CreditItem from 'core/blocks/other/CreditItem'
import { usePageContext } from 'core/helpers/pageContext'

const ConclusionBlock = ({ block, data: entities }) => {
    const { currentEdition } = usePageContext()
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
                    labelId={`conclusion.${currentEdition.id}.bio`}
                />
            </Heading>
            <T k={`conclusion.${currentEdition.id}`} md={true} />
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
            font-size: ${fontSize('largerer')};
        }
    }
`

export default ConclusionBlock
