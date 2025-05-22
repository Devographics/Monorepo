import './FreeformAnswers.scss'
import React from 'react'
import {
    CommentFooter_,
    CommentIndex,
    CommentItem_,
    CommentMessage,
    CommentMessageWrapper,
    CommentQuote,
    CommentReportLink,
    getCommentReportUrl
} from 'core/blocks/block/CommentsTrigger'
import T from 'core/i18n/T'
import { RawDataItem } from '@devographics/types'

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
        <CommentItem_>
            <CommentMessageWrapper>
                <CommentQuote>“</CommentQuote>
                <CommentIndex>#{index + 1}</CommentIndex>
                <CommentMessage>{raw}</CommentMessage>
            </CommentMessageWrapper>
            <CommentFooter_>
                <CommentReportLink
                    href={getCommentReportUrl({
                        responseId,
                        message: raw,
                        name: questionLabel + '/' + tokenLabel
                    })}
                >
                    <T k="answers.report_abuse" />
                </CommentReportLink>
            </CommentFooter_>
        </CommentItem_>
    )
}
