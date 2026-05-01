import React from 'react'
import AwardBlock from 'core/blocks/awards/AwardBlock'
import { Entity } from '@devographics/types'
import { BlockWithAwards } from 'core/types'
import './AwardsBlock.scss'

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
    <div className="awards-wrapper">
        {block.awards.map(award => (
            <AwardBlock key={award.id} block={award} entities={entities} />
        ))}
    </div>
)

export default AwardsBlock
