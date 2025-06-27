import './FreeformAnswers.scss'
import React from 'react'
import { CommentIcon } from 'core/icons/Comment'
import ModalTrigger from 'core/components/ModalTrigger'
import { usePageContext } from 'core/helpers/pageContext'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import Tooltip from 'core/components/Tooltip'
import T from 'core/i18n/T'
import { formatNumber } from '../helpers/format'
import { Bucket, FacetBucket } from '@devographics/types'
import { CATCHALL_PREFIX } from '@devographics/constants'
import { getBlockTitle } from 'core/helpers/blockHelpers'
import { BlockVariantDefinition } from 'core/types'
import Button from 'core/components/Button'
import { FreeformAnswersQueryWrapper } from './FreeformAnswersQueryWrapper'
import { useAllQuestionsMetadata } from 'core/charts/horizontalBar2/helpers/other'

export const FreeformAnswersTrigger = (props: {
    bucket: Bucket | FacetBucket
    questionId: string
    sectionId: string
    block: BlockVariantDefinition
    enableModal: boolean
}) => {
    const { questionId, bucket, sectionId, block, enableModal } = props
    const { id, count, entity, token } = bucket
    const { getString } = useI18n()
    const pageContext = usePageContext()

    const surveyId = pageContext.currentSurvey.id
    const editionId = pageContext.currentEdition.id
    const queryOptions = {
        surveyId,
        editionId,
        sectionId: block?.queryOptions?.sectionId || sectionId,
        questionId,
        token: id.replace(CATCHALL_PREFIX, '')
    }
    const i18nNamespace = block.i18nNamespace || questionId

    const allQuestions = useAllQuestionsMetadata()
    const question = allQuestions.find(q => q.id === questionId)

    const questionLabel = getBlockTitle({ block, pageContext, getString })

    const labelObject = getItemLabel({
        id,
        getString,
        i18nNamespace,
        entity,
        html: true
    })
    const tokenLabel = labelObject.label

    const answersLabel = getString('answers.answers_for', { values: { name: tokenLabel } })?.t

    const label = (
        <span>
            <CommentIcon size={'small'} label={answersLabel} enableTooltip={false} />{' '}
            {formatNumber(count || 0)}
        </span>
    )

    return enableModal ? (
        <ModalTrigger
            size="l"
            trigger={
                <div>
                    <Tooltip
                        trigger={
                            <Button className="button-round chart-freeform-answers chart-freeform-answers-button">
                                {label}
                            </Button>
                        }
                        contents={
                            <T k="answers.answers_for" values={{ name: tokenLabel }} md={true} />
                        }
                    />
                </div>
            }
        >
            <FreeformAnswersQueryWrapper
                queryOptions={queryOptions}
                questionLabel={questionLabel}
                tokenLabel={tokenLabel}
                block={block}
                question={question}
            />
        </ModalTrigger>
    ) : (
        <div className="chart-freeform-answers">{label}</div>
    )
}
