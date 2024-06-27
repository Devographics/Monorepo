import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize, secondaryFontMixin } from 'core/theme'
import T from 'core/i18n/T'
import CreditItem from 'core/blocks/other/CreditItem'
import { usePageContext } from 'core/helpers/pageContext'

const ConclusionBlock = ({ block, data: author }) => {
    const { currentEdition } = usePageContext()
    const { variables } = block
    if (!author) {
        return null
    }
    return (
        <Conclusion className="Conclusion">
            <Heading>
                {/* <Title>
                    <T k="sections.conclusion.title" />
                </Title> */}
                <CreditItem
                    id={author?.id}
                    entity={author}
                    labelId={`conclusion.${currentEdition.id}.${author.id}.bio`}
                />
            </Heading>
            <T
                k={`conclusion.${currentEdition.id}.${author.id}`}
                md={true}
                fallback={variables.contents}
            />
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
