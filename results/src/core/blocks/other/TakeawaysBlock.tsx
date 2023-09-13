import React from 'react'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'
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
        <div>
            <T k={`takeaways.${id}`} md={true} html={true} />
        </div>
    )
}
const Wrapper = styled.div`
    @media ${mq.mediumLarge} {
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: ${spacing(6)};
        row-gap: ${spacing(4)};
    }
`

export default TakeawaysBlock
