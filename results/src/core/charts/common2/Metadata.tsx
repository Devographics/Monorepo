import './Metadata.scss'
import { YearCompletion } from '@devographics/types'
import BlockQuestion from 'core/blocks/block/BlockQuestion'
import { BlockDefinition } from 'core/types'
import React from 'react'

export const Metadata = ({
    block,
    completion
}: {
    block: BlockDefinition
    completion: YearCompletion
}) => {
    const { count, percentageSurvey, total } = completion
    return (
        <div className="chart-metadata">
            <BlockQuestion block={block} />

            <div>
                {' '}
                {count}/{total} ({percentageSurvey}%)
            </div>
        </div>
    )
}

export default Metadata
