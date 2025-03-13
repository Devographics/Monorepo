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
import { formatNumber } from './helpers/format'
import { Bucket, FacetBucket, RawDataItem, StandardQuestionData } from '@devographics/types'
import { CATCHALL_PREFIX } from '@devographics/constants'
import { getBlockTitle } from 'core/helpers/blockHelpers'
import { BlockVariantDefinition } from 'core/types'
import Button from 'core/components/Button'
import Toggle, { DEFAULT_SORT, ToggleItemType } from './Toggle'
import { OrderOptions } from './types'
import sortBy from 'lodash/sortBy'

export const LENGTH = 'length'

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
        sectionId: block?.queryOptions?.sectionId || sectionId,
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

    if (queryOptions.questionId === 'source') {
        // since "source" is a composite field, overwrite queryOptions to instead
        // show raw data for user_info.how_did_user_find_out_about_the_survey
        queryOptions.sectionId = 'user_info'
        queryOptions.questionId = 'how_did_user_find_out_about_the_survey'
    }

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

    const count = data.length

    return (
        <div>
            <h2 className="chart-freeform-answers-heading">
                {questionLabel}:{' '}
                <T k="answers.answers_for" values={{ count, name: tokenLabel }} md={true} />
            </h2>
            <p>
                <T k="answers.description" values={{ count, name: tokenLabel }} md={true} />
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
    answers: answers_,
    questionLabel,
    tokenLabel
}: {
    answers: RawDataItem[]
    questionLabel: string
    tokenLabel: string
}) => {
    const { getString } = useI18n()
    const [filter, setFilter] = useState<string | null>(null)
    const [sort, setSort] = useState<string | null>(null)
    const [order, setOrder] = useState<OrderOptions | null>(null)

    const labelKey = 'answers.length'

    let answers = answers_
    if (sort) {
        answers = sortBy(answers, a => a.raw.length)
    }
    if (order && order === OrderOptions.DESC) {
        answers = answers.toReversed()
    }
    if (filter) {
        answers = answers.filter(answer => answer.raw.toLowerCase().includes(filter.toLowerCase()))
    }
    return (
        <div className="freeform-answers-list">
            <div className="freeform-answers-options">
                <KeywordFilter
                    keywordFilter={filter}
                    setKeywordFilter={setFilter}
                    items={answers}
                />
                <OrderToggle sort={sort} setSort={setSort} order={order} setOrder={setOrder} />
                {/* <Toggle
                    sortOrder={order}
                    labelId="charts.sort_by"
                    handleSelect={handleSelect}
                    items={toggleItems}
                    hasDefault={true}
                /> */}
            </div>
            {answers?.map((answer, i) => (
                <FreeformAnswerItem
                    key={i}
                    index={i}
                    {...answer}
                    questionLabel={questionLabel}
                    tokenLabel={tokenLabel}
                    keyword={filter}
                />
            ))}
        </div>
    )
}

export const KeywordFilter = ({
    keywordFilter,
    setKeywordFilter,
    items
}: {
    keywordFilter: string | null
    setKeywordFilter: React.Dispatch<React.SetStateAction<string | null>>
    items: any[]
}) => {
    return (
        <div className="freeform-answers-filter">
            <h4>
                <T k="answers.keyword" />
            </h4>
            <input
                type="text"
                value={keywordFilter || ''}
                onChange={e => {
                    setKeywordFilter(e.target.value)
                }}
            />
            <T k="answers.keyword_count" values={{ count: items.length }} />
        </div>
    )
}

export const OrderToggle = ({
    sort,
    setSort,
    order,
    setOrder
}: {
    sort: string | null
    setSort: React.Dispatch<React.SetStateAction<string | null>>
    order: OrderOptions | null
    setOrder: React.Dispatch<React.SetStateAction<OrderOptions | null>>
}) => {
    const { getString } = useI18n()

    const labelKey = 'answers.length'
    const toggleItems: ToggleItemType[] = [
        {
            id: LENGTH,
            label: getString(labelKey)?.t,
            labelKey,
            isEnabled: sort === LENGTH
        }
    ]

    const handleSelect = (optionId: string) => {
        const isEnabled = sort === optionId
        if (optionId === DEFAULT_SORT) {
            setSort(undefined)
            setOrder(undefined)
        } else if (!isEnabled) {
            setSort(optionId as string)
            setOrder(OrderOptions.ASC)
        } else if (sort && order === OrderOptions.ASC) {
            setOrder(OrderOptions.DESC)
        } else {
            setSort(undefined)
            setOrder(undefined)
        }
    }

    return (
        <Toggle
            sortOrder={order}
            labelId="charts.sort_by"
            handleSelect={handleSelect}
            items={toggleItems}
            hasDefault={true}
        />
    )
}

const FreeformAnswerItem = ({
    raw,
    responseId,
    index,
    questionLabel,
    tokenLabel,
    keyword
}: RawDataItem & {
    index: number
    questionLabel: string
    tokenLabel: string
    keyword?: string
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
