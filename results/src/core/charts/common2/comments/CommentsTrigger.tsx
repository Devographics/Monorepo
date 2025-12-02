import React from 'react'
import { CommentIcon } from '@devographics/icons'
import ModalTrigger from 'core/components/ModalTrigger'
import { usePageContext } from 'core/helpers/pageContext'
import { useI18n } from '@devographics/react-i18n'
import { useAllQuestionsMetadata } from '../../horizontalBar2/helpers/other'
import Tooltip from 'core/components/Tooltip'
import T from 'core/i18n/T'
import { getQuestionLabel } from '../helpers/labels'
import { BlockVariantDefinition } from 'core/types'
import Button from 'core/components/Button'
import { CommentsQueryWrapper } from './CommentsQueryWrapper'

export const CommentsTrigger = ({
    block,
    questionId,
    commentsCount
}: {
    block: BlockVariantDefinition
    questionId: string
    commentsCount: number
}) => {
    const { getString } = useI18n()
    const pageContext = usePageContext()

    const allQuestions = useAllQuestionsMetadata()
    const question = allQuestions.find(q => q.id === questionId)

    if (!question) {
        return null
    }

    const surveyId = pageContext.currentSurvey.id
    const editionId = pageContext.currentEdition.id
    const sectionId = question.sectionId
    const queryOptions = { surveyId, editionId, sectionId, questionId }
    const i18nNamespace = block.i18nNamespace || sectionId

    const label = getQuestionLabel({ question, getString, i18nNamespace, block })
    const commentLabel = getString('comments.comments_for', { values: { name: label.label } })?.t

    return (
        <ModalTrigger
            size="l"
            trigger={
                <div className="chart-comments-wrapper">
                    <Tooltip
                        trigger={
                            <Button className="button-round chart-comments">
                                <CommentIcon
                                    size={'small'}
                                    label={commentLabel}
                                    enableTooltip={false}
                                />{' '}
                                {commentsCount || 0}
                            </Button>
                        }
                        contents={
                            <T k="comments.comments_for" values={{ name: label.label }} md={true} />
                        }
                    />
                </div>
            }
        >
            <CommentsQueryWrapper queryOptions={queryOptions} block={block} question={question} />
        </ModalTrigger>
    )
}
