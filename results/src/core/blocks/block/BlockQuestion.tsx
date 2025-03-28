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
            <Question_ className="block-question">
                <QuestionLeft_>
                    <QuestionIcon /> <QuestionContents_>{blockQuestion}</QuestionContents_>
                </QuestionLeft_>
                <div className="question-right">
                    {isFreeformQuestion && <FreeformIndicator showLabel={true} />}
                    {isMultipleQuestion && <MultipleIndicator showLabel={true} />}
                </div>
            </Question_>
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

const Question_ = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: ${({ theme }) => theme.colors.backgroundAlt};
    border-radius: 100px;
    padding: ${spacing(0.5)};
    font-size: ${fontSize('small')};
    margin-top: var(--spacing);
`
const QuestionLeft_ = styled.div`
    .rawchartmode & {
        display: none;
    }
    display: flex;
    align-items: center;
    gap: ${spacing(0.5)};
    p {
        &:last-child {
            margin: 0;
        }
    }
`

const QuestionContents_ = styled.div``

export default BlockQuestion
