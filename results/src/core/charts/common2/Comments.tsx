import React, { useState, useEffect } from 'react'
import T from 'core/i18n/T'
import { runQuery } from 'core/explorer/data'
import {
    Comment,
    FeaturesOptions,
    QuestionMetadata,
    SimplifiedSentimentOptions,
    StandardQuestionData
} from '@devographics/types'
import './Comments.scss'
import { CommentsFilters } from './CommentsFilters'
import { CommentItem } from './CommentItem'
import { OrderOptions } from './types'
import sortBy from 'lodash/sortBy'
import { ALPHA, LENGTH } from './FreeformAnswers'

type GetQueryNameProps = {
    editionId: string
    questionId: string
}
const getQueryName = ({ editionId, questionId }: GetQueryNameProps) =>
    `${editionId}${questionId}CommentsQuery`

type GetQueryProps = {
    surveyId: string
    editionId: string
    sectionId: string
    questionId: string
}
const getQuery = ({ surveyId, editionId, sectionId, questionId }: GetQueryProps) => {
    return `
query ${getQueryName({ editionId, questionId })} {
    surveys {
        ${surveyId} {
            ${editionId} {
                ${sectionId} {
                    ${questionId} {
                        comments {
                            currentEdition {
                                commentsRaw {
                                    message
                                    experience
                                    sentiment
                                    responseId
                                    responseValue
                                }
                                count
                                year
                            }
                        }
                    }
                }
            }
        }
    }
}`
}

interface CommentsCommonProps {
    name: string
    question: QuestionMetadata
}
export const CommentsWrapper = ({
    queryOptions,
    name,
    question
}: { queryOptions: GetQueryProps } & CommentsCommonProps) => {
    const [data, setData] = useState<Comment[]>([])
    const [error, setError] = useState<any>(null)
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
            if (error) {
                setError(error)
            } else {
                const questionData =
                    result?.surveys?.[surveyId]?.[editionId]?.[sectionId]?.[questionId]
                const comments = questionData?.comments?.currentEdition?.commentsRaw
                if (comments) {
                    setData(comments)
                }
            }
            setIsLoading(false)
        }

        getData()
    }, [])
    return (
        <div>
            <h2>
                <T k="comments.comments_for" values={{ name }} />
            </h2>
            <p>
                <T k="comments.description" />
            </p>
            <div>
                {isLoading ? (
                    <div>Loading…</div>
                ) : error ? (
                    <div className="error">
                        <code>{error?.message}</code>
                    </div>
                ) : (
                    <CommentsContent comments={data} name={name} question={question} />
                )}
            </div>
        </div>
    )
}

export const filterCommentsByValue = (comments: Comment[], value: string | number) =>
    value === ''
        ? comments
        : comments.filter(c =>
              Array.isArray(c.responseValue)
                  ? c.responseValue.map(String).includes(String(value))
                  : String(c.responseValue) === String(value)
          )

export const filterCommentsByExperience = (comments: Comment[], value: string | number | null) =>
    value === '' ? comments : comments.filter(c => String(c.experience) === String(value))

export const filterCommentsBySentiment = (comments: Comment[], value: string | number | null) =>
    value === '' ? comments : comments.filter(c => String(c.sentiment) === String(value))

export interface CommentsFiltersState {
    experienceFilter: FeaturesOptions | ''
    setExperienceFilter: React.Dispatch<React.SetStateAction<FeaturesOptions | ''>>
    sentimentFilter: SimplifiedSentimentOptions | ''
    setSentimentFilter: React.Dispatch<React.SetStateAction<SimplifiedSentimentOptions | ''>>
    valueFilter: string | number | ''
    setValueFilter: React.Dispatch<React.SetStateAction<string | number | ''>>
    sort: string | null
    setSort: React.Dispatch<React.SetStateAction<string | null>>
    order: OrderOptions | null
    setOrder: React.Dispatch<React.SetStateAction<OrderOptions | null>>
    keywordFilter: string | null
    setKeywordFilter: React.Dispatch<React.SetStateAction<string | null>>
}

export const CommentsContent = ({
    comments,
    name,
    question
}: {
    comments: Comment[]
} & CommentsCommonProps) => {
    const [experienceFilter, setExperienceFilter] = useState<FeaturesOptions | ''>('')
    const [sentimentFilter, setSentimentFilter] = useState<SimplifiedSentimentOptions | ''>('')
    const [valueFilter, setValueFilter] = useState<string | number>('')

    const [sort, setSort] = useState<string | null>(null)
    const [order, setOrder] = useState<OrderOptions | null>(null)
    const [keywordFilter, setKeywordFilter] = useState<string | null>(null)

    const stateStuff: CommentsFiltersState = {
        experienceFilter,
        setExperienceFilter,
        sentimentFilter,
        setSentimentFilter,
        valueFilter,
        setValueFilter,
        sort,
        setSort,
        order,
        setOrder,
        keywordFilter,
        setKeywordFilter
    }

    let filteredComments = comments

    filteredComments = filterCommentsByExperience(filteredComments, experienceFilter)
    filteredComments = filterCommentsBySentiment(filteredComments, sentimentFilter)
    filteredComments = filterCommentsByValue(filteredComments, valueFilter)

    if (sort === LENGTH) {
        filteredComments = sortBy(filteredComments, comment => comment.message.length)
    } else if (sort === ALPHA) {
        filteredComments = sortBy(filteredComments, comment => comment.message.toLowerCase())
    }
    if (order && order === OrderOptions.DESC) {
        filteredComments = filteredComments.toReversed()
    }

    if (keywordFilter) {
        filteredComments = filteredComments.filter(comment =>
            comment.message.toLowerCase().includes(keywordFilter.toLowerCase())
        )
    }
    return (
        <div>
            <CommentsFilters
                comments={filteredComments}
                allComments={comments}
                question={question}
                stateStuff={stateStuff}
            />
            <div className="comments-list">
                {filteredComments?.map((comment, i) => (
                    <CommentItem key={i} index={i} {...comment} name={name} question={question} />
                ))}
            </div>
        </div>
    )
}
