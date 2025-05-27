import './FreeformAnswers.scss'
import React from 'react'
import T from 'core/i18n/T'
import { RawDataItem } from '@devographics/types'
import { getCommentReportUrl, highlightWordStarts } from '../comments/CommentsItem'
import { CommentsItemWrapper } from '../comments/CommentsItemWrapper'
import { FreeformAnswersState } from './types'

export const FreeformAnswerItem = ({
    raw,
    responseId,
    index,
    questionLabel,
    tokenLabel,
    stateStuff
}: RawDataItem & {
    index: number
    questionLabel: string
    tokenLabel: string
    stateStuff: FreeformAnswersState
}) => {
    const { keywordFilter, searchFilter } = stateStuff
    let formattedMessage = raw
    if (keywordFilter) {
        formattedMessage = highlightWordStarts(formattedMessage, keywordFilter)
    }
    if (searchFilter) {
        formattedMessage = highlightWordStarts(formattedMessage, searchFilter)
    }

    return (
        <CommentsItemWrapper
            index={index}
            contents={formattedMessage}
            answer={null}
            reportLink={getCommentReportUrl({
                responseId,
                message: raw,
                questionLabel: questionLabel + '/' + tokenLabel
            })}
        />
    )
}
