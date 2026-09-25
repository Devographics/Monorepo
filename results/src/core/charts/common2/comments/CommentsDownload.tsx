import React from 'react'
import { FilterSection } from './CommentsFilters'
import { getDownloadHandler } from './download'
import Button from 'core/components/Button'
import { Comment, QuestionMetadata } from '@devographics/types'
import T from 'core/i18n/T'

export const CommentsDownload = ({
    comments,
    question
}: {
    comments: Comment[]
    question: QuestionMetadata
}) => {
    return (
        <FilterSection headingId="download">
            <Button
                size="small"
                onClick={getDownloadHandler<Comment>(comments, `${question.id}_comments`)}
            >
                <T k="comments.download" />
            </Button>
        </FilterSection>
    )
}
