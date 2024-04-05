import React from 'react'
import styled from 'styled-components'
import { fontSize, spacing } from 'core/theme'
import { useBlockQuestion } from 'core/helpers/blockHelpers'
import { BlockVariantDefinition } from 'core/types'
import { QuestionIcon } from 'core/icons'
import { FreeformIndicator } from 'core/charts/common2'

export const BlockQuestion = ({
    block,
    question
}: {
    block?: BlockVariantDefinition
    question?: string
}) => {
    const blockQuestion = question || (block && useBlockQuestion({ block }))
    const isFreeformQuestion = ['multiple_options2_freeform'].includes(block.template)
    if (blockQuestion) {
        return (
            <Question_ className="Block__Question">
                <QuestionLeft_>
                    <QuestionIcon /> <QuestionContents_>{blockQuestion}</QuestionContents_>
                </QuestionLeft_>
                {isFreeformQuestion && <FreeformIndicator showLabel={true} />}
            </Question_>
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
