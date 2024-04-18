import React from 'react'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'
import AwardBlock from 'core/blocks/awards/AwardBlock'
import { Entity } from '@devographics/types'
import { BlockWithAwards } from 'core/types'

/**
 * All awards categories
 */
const AwardsBlock = ({
    block,
    data: entities
}: {
    /**
     * First level are "awards categories",
     * second level are the actual awards
     */
    block: BlockWithAwards
    data: Array<Entity>
}) => (
    <Wrapper>
        {block.awards.map(award => (
            <AwardBlock key={award.id} block={award} entities={entities} />
        ))}
    </Wrapper>
)

const Wrapper = styled.div`
    @media ${mq.mediumLarge} {
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: ${spacing(6)};
        row-gap: ${spacing(4)};
    }
`

export default AwardsBlock
