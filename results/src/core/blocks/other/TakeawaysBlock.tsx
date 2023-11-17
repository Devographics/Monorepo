import React from 'react'
import styled from 'styled-components'
import { fontSize, fontWeight, mq, spacing } from 'core/theme'
import { Entity } from '@devographics/types'
import { BlockDefinition } from 'core/types'
import T from 'core/i18n/T'

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
    block: BlockDefinition
    data: Array<Entity>
}) => (
    <Wrapper>
        {block.items.map(item => (
            <Takeaway key={item} id={item} />
        ))}
    </Wrapper>
)

const Takeaway = ({ id }) => {
    return (
        <Takeaway_>
            <Heading_>
                <T k={`takeaways.${id}.heading`} md={true} html={true} />
            </Heading_>
            <Content_>
                <T k={`takeaways.${id}`} md={true} html={true} />
            </Content_>
        </Takeaway_>
    )
}
const Wrapper = styled.div`
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
