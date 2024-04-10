import React from 'react'
import styled from 'styled-components'
import { fontSize, spacing } from 'core/theme'
import { useBlockQuestion } from 'core/helpers/blockHelpers'
import { BlockDefinition } from 'core/types'
import { QuestionIcon } from 'core/icons'

export const BlockQuestion = ({
    block,
    question
}: {
    block?: BlockDefinition
    question?: string
}) => {
    const blockQuestion = question || (block && useBlockQuestion({ block }))
    if (blockQuestion) {
        return (
            <Question_ className="Block__Question">
                <QuestionIcon /> <QuestionContents_>{blockQuestion}</QuestionContents_>
            </Question_>
        )
    }
    return null
}

const Question_ = styled.div`
    .rawchartmode & {
        display: none;
    }
    margin-top: ${spacing(1)};
    display: flex;
    align-items: center;
    gap: ${spacing(0.5)};
    background: ${({ theme }) => theme.colors.backgroundAlt};
    border-radius: 100px;
    padding: ${spacing(0.5)};
    font-size: ${fontSize('small')};
    p {
        &:last-child {
            margin: 0;
        }
    }
`

const QuestionContents_ = styled.div``

export default BlockQuestion
