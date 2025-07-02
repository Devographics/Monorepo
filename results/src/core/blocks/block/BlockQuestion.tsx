import React from 'react'
import styled from 'styled-components'
import { fontSize, spacing } from 'core/theme'
import { useBlockQuestion } from 'core/helpers/blockHelpers'
import { BlockVariantDefinition } from 'core/types'
import { QuestionIcon } from 'core/icons'
import { FreeformIndicator } from 'core/charts/common2/FreeformIndicator'
import { MultipleIndicator } from 'core/charts/common2/MultipleIndicator'
import Tooltip from 'core/components/Tooltip'
import './BlockQuestion.scss'
import { QuestionMetadata } from '@devographics/types'

export const BlockQuestion = ({
    block,
    question
}: {
    block?: BlockVariantDefinition
    question?: QuestionMetadata
}) => {
    const blockQuestion = block && useBlockQuestion({ block })
    const isFreeformQuestion = ['multiple_options2_freeform'].includes(block.template)
    const isMultipleQuestion = question?.allowMultiple
    if (blockQuestion) {
        return (
            <div className="block-question">
                <QuestionIcon />
                <div className="block-question-inner">
                    <div className="block-question-left">{blockQuestion}</div>
                    <div className="block-question-right">
                        {isFreeformQuestion && <FreeformIndicator showLabel={true} />}
                        {isMultipleQuestion && <MultipleIndicator showLabel={true} />}
                    </div>
                </div>
            </div>
        )
    }
    return null
}

export const BlockQuestionTooltip = ({
    block,
    question
}: {
    block?: BlockVariantDefinition
    question?: string
}) => {
    const blockQuestion = question || (block && useBlockQuestion({ block }))
    if (blockQuestion) {
        return (
            <Tooltip
                trigger={
                    <span>
                        <QuestionIcon />
                    </span>
                }
                contents={blockQuestion}
                showBorder={false}
            />
        )
    }
    return null
}

export default BlockQuestion
