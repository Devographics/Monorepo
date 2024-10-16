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
import { Entity } from '@devographics/types'
import { getQuestionLabel } from './helpers/labels'
import { BlockVariantDefinition } from 'core/types'

export const Comments = ({
    block,
    questionId,
    commentsCount,
    entity
}: {
    block: BlockVariantDefinition
    questionId: string
    commentsCount: number
    entity?: Entity
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

    const label = getQuestionLabel({ question, getString, i18nNamespace })
    const commentLabel = getString('comments.comments_for', { values: { name: label.label } })?.t

    // TODO: find a better way to do this; or dynamically adapt filters to question
    const hasFilters = ['featurev3', 'toolv3'].includes(question.template)
    return (
        <ModalTrigger
            trigger={
                <div className="chart-comments-wrapper">
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
            <CommentsWrapper
                queryOptions={queryOptions}
                name={label.label}
                hasFilters={hasFilters}
            />
        </ModalTrigger>
    )
}
