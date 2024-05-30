import './FreeformAnswers.scss'
import React, { useEffect, useState } from 'react'
import { CommentIcon } from 'core/icons/Comment'
import ModalTrigger from 'core/components/ModalTrigger'
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
import { usePageContext } from 'core/helpers/pageContext'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import Tooltip from 'core/components/Tooltip'
import T from 'core/i18n/T'
import { runQuery } from 'core/explorer/data'
import { formatNumber } from './helpers/labels'
import { Bucket, FacetBucket, RawDataItem, StandardQuestionData } from '@devographics/types'
import { CATCHALL_PREFIX } from '@devographics/constants'
import { getBlockTitle } from 'core/helpers/blockHelpers'
import { BlockVariantDefinition } from 'core/types'

type GetQueryNameProps = {
    editionId: string
    questionId: string
    token: string
}
const getQueryName = ({ editionId, questionId, token }: GetQueryNameProps) =>
    `${editionId}${questionId}__${token}__RawDataQuery`

type GetQueryProps = {
    surveyId: string
    editionId: string
    sectionId: string
    questionId: string
    token: string
}
const getQuery = ({ surveyId, editionId, sectionId, questionId, token }: GetQueryProps) => {
    return `
query ${getQueryName({ editionId, questionId, token })} {
    surveys {
        ${surveyId} {
            ${editionId} {
                ${sectionId} {
                    ${questionId} {
                        freeform {
                            rawData(token: "${token}") {
                                responseId
                                tokens {
                                    id
                                }
                                raw
                            }
                        }
                    }
                }
            }
        }
    }
}`
}

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
        sectionId,
        questionId,
        token: id.replace(CATCHALL_PREFIX, '')
    }
    const i18nNamespace = sectionId

    const questionLabel = getBlockTitle({ block, pageContext, getString })

    const { label: tokenLabel } = getItemLabel({
        id,
        getString,
        i18nNamespace,
        entity,
        html: true
    })

    const answersLabel = getString('answers.answers_for', { values: { name: tokenLabel } })?.t

    const label = (
        <span>
            <CommentIcon size={'small'} label={answersLabel} enableTooltip={false} />{' '}
            {formatNumber(count || 0)}
        </span>
    )

    return enableModal ? (
        <ModalTrigger
            trigger={
                <div>
                    <Tooltip
                        trigger={
                            <button className="chart-freeform-answers chart-freeform-answers-button">
                                {label}
                            </button>
                        }
                        contents={
                            <T k="answers.answers_for" values={{ name: tokenLabel }} md={true} />
                        }
                    />
                </div>
            }
        >
            <FreeformAnswersModal
                queryOptions={queryOptions}
                questionLabel={questionLabel}
                tokenLabel={tokenLabel}
            />
        </ModalTrigger>
    ) : (
        <div className="chart-freeform-answers">{label}</div>
    )
}

export const FreeformAnswersModal = ({
    queryOptions,
    questionLabel,
    tokenLabel
}: {
    queryOptions: GetQueryProps
    questionLabel: string
    tokenLabel: string
}) => {
    const [data, setData] = useState<RawDataItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { surveyId, editionId, sectionId, questionId } = queryOptions
    useEffect(() => {
        const getData = async () => {
            setIsLoading(true)
            const query = getQuery(queryOptions)

            const url = process.env.GATSBY_API_URL
            if (!url) {
                throw new Error('GATSBY_API_URL env variable is not set')
            }
            const { result, error } = await runQuery<StandardQuestionData>(
                url,
                query,
                getQueryName(queryOptions)
            )
            const questionData = result?.surveys?.[surveyId]?.[editionId]?.[sectionId]?.[questionId]
            const rawData = questionData?.freeform?.rawData
            if (rawData) {
                setData(rawData)
            }

            setIsLoading(false)
        }

        getData()
    }, [])
    return (
        <div>
            <h2 className="chart-freeform-answers-heading">
                {questionLabel}:{' '}
                <T k="answers.answers_for" values={{ name: tokenLabel }} md={true} />
            </h2>
            <p>
                <T k="answers.description" values={{ name: tokenLabel }} md={true} />
            </p>
            <div>
                {isLoading ? (
                    <div>Loading…</div>
                ) : (
                    <FreeformAnswers
                        answers={data}
                        questionLabel={questionLabel}
                        tokenLabel={tokenLabel}
                    />
                )}
            </div>
        </div>
    )
}

const FreeformAnswers = ({
    answers,
    questionLabel,
    tokenLabel
}: {
    answers: RawDataItem[]
    questionLabel: string
    tokenLabel: string
}) => {
    return (
        <div className="freeform-answers-list">
            {answers?.map((answer, i) => (
                <FreeformAnswerItem
                    key={i}
                    index={i}
                    {...answer}
                    questionLabel={questionLabel}
                    tokenLabel={tokenLabel}
                />
            ))}
        </div>
    )
}

const FreeformAnswerItem = ({
    raw,
    responseId,
    index,
    questionLabel,
    tokenLabel
}: RawDataItem & { index: number; questionLabel: string; tokenLabel: string }) => {
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
