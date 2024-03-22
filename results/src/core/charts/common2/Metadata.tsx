import './Metadata.scss'
import { YearCompletion } from '@devographics/types'
import BlockQuestion from 'core/blocks/block/BlockQuestion'
import T from 'core/i18n/T'
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

            <div className="chart-metadata-completion">
                <T
                    k="chart_units.respondents"
                    values={{ count, percentage: percentageSurvey, total }}
                    html={true}
                    md={true}
                />
            </div>
        </div>
    )
}

export default Metadata
