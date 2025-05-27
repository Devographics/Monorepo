import './FreeformAnswers.scss'
import React from 'react'
import T from 'core/i18n/T'
import { RawDataItem } from '@devographics/types'
import { getCommentReportUrl } from '../comments/CommentsItem'
import { CommentsItemWrapper } from '../comments/CommentsItemWrapper'

export const FreeformAnswerItem = ({
    raw,
    responseId,
    index,
    questionLabel,
    tokenLabel
}: RawDataItem & {
    index: number
    questionLabel: string
    tokenLabel: string
}) => {
    return (
        <CommentsItemWrapper
            index={index}
            contents={raw}
            answer={null}
            reportLink={getCommentReportUrl({
                responseId,
                message: raw,
                questionLabel: questionLabel + '/' + tokenLabel
            })}
        />
    )
}
