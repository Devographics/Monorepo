import './Comments.scss'
import React from 'react'
import { CommentIcon } from 'core/icons/Comment'
import ModalTrigger from 'core/components/ModalTrigger'
import { CommentsWrapper } from 'core/blocks/block/CommentsTrigger'
import { usePageContext } from 'core/helpers/pageContext'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import { CombinedItem } from '../multiItemsExperience/types'
import { useAllQuestionsMetadata } from '../horizontalBar2/helpers/other'
import Tooltip from 'core/components/Tooltip'
import T from 'core/i18n/T'

export const Comments = ({ item }: { item: CombinedItem }) => {
    const { getString } = useI18n()
    const pageContext = usePageContext()

    const { id: questionId, commentsCount } = item
    const allQuestions = useAllQuestionsMetadata()
    const question = allQuestions.find(q => q.id === questionId)

    const surveyId = pageContext.currentSurvey.id
    const editionId = pageContext.currentEdition.id
    const sectionId = question?.sectionId
    const queryOptions = { surveyId, editionId, sectionId, questionId }
    const i18nNamespace = sectionId

    const label = getItemLabel({
        id: questionId,
        entity: item.entity,
        getString,
        i18nNamespace
    })

    const commentLabel = getString('comments.comments_for', { values: { name: label.label } })?.t

    return (
        <ModalTrigger
            trigger={
                <div>
                    <Tooltip
                        trigger={
                            <button className="chart-comments">
                                <CommentIcon
                                    size={'small'}
                                    label={commentLabel}
                                    enableTooltip={false}
                                />{' '}
                                {commentsCount || 0}
                            </button>
                        }
                        contents={
                            <T k="comments.comments_for" values={{ name: label.label }} md={true} />
                        }
                    />
                </div>
            }
        >
            <CommentsWrapper queryOptions={queryOptions} name={label.label} />
        </ModalTrigger>
    )
}
