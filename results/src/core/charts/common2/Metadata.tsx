import './Metadata.scss'
import { YearCompletion } from '@devographics/types'
import BlockQuestion from 'core/blocks/block/BlockQuestion'
import { useBlockQuestion } from 'core/helpers/blockHelpers'
import T from 'core/i18n/T'
import { QuestionIcon } from 'core/icons'
import { BlockVariantDefinition } from 'core/types'
import React from 'react'

export const Metadata = ({
    block,
    completion
}: {
    block: BlockVariantDefinition
    completion: YearCompletion
}) => {
    const { count, percentageSurvey, total } = completion
    const blockQuestion = useBlockQuestion({ block })

    return (
        <div className="chart-metadata">
            {/* <div className="chart-metadata-question">
                <QuestionIcon size="petite" /> <div>{blockQuestion}</div>
            </div> */}
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
