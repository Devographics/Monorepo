import React from 'react'
import styled from 'styled-components'
import { fontSize, fontWeight, mq, spacing } from 'core/theme'
import { Entity } from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'
import T from 'core/i18n/T'
import { useI18n } from '@devographics/react-i18n'

/**
 * All awards categories
 */
const TakeawaysBlock = ({
    block,
    data
}: {
    /**
     * First level are "awards categories",
     * second level are the actual awards
     */
    block: BlockVariantDefinition
    data: Array<Entity>
}) => (
    <Wrapper>
        {block.items.map(item => (
            <Takeaway key={item} id={item} />
        ))}
    </Wrapper>
)

const Takeaway = ({ id }) => {
    const { getString } = useI18n()
    const heading = getString(`takeaways.${id}.heading`)?.t
    return (
        <Takeaway_>
            {heading && (
                <Heading_>
                    <T k={`takeaways.${id}.heading`} md={true} html={true} />
                </Heading_>
            )}
            <Content_>
                <T k={`takeaways.${id}`} md={true} html={true} />
            </Content_>
        </Takeaway_>
    )
}
const Wrapper = styled.div`
    @media ${mq.small} {
        display: flex;
        flex-direction: column;
        gap: ${spacing()};
    }
    @media ${mq.mediumLarge} {
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: ${spacing(2)};
        row-gap: ${spacing(2)};
    }
`

const Takeaway_ = styled.section`
    font-size: ${fontSize('large')};
    background: ${({ theme }) => theme.colors.backgroundAlt};
    border-radius: 30px;
    padding: ${spacing()};
`

const Heading_ = styled.h3`
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textAlt};
    margin-bottom: ${spacing(0.25)};
    font-weight: ${fontWeight('medium')};
    font-size: ${fontSize('large')};
`
const Content_ = styled.div``

export default TakeawaysBlock
