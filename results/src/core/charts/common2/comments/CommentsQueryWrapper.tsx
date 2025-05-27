import React, { useState, useEffect } from 'react'
import T from 'core/i18n/T'
import { runQuery } from 'core/explorer/data'
import { StandardQuestionData } from '@devographics/types'
import { Comments } from './Comments'
import { CommentsCommonProps, CommentsData } from './types'
import { getQuestionLabel } from '../helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import BlockQuestion from 'core/blocks/block/BlockQuestion'

type GetQueryProps = {
    surveyId: string
    editionId: string
    sectionId: string
    questionId: string
}

type GetQueryNameProps = {
    editionId: string
    questionId: string
}
const getQueryName = ({ editionId, questionId }: GetQueryNameProps) =>
    `${editionId}${questionId}CommentsQuery`

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
                                commentsStats {
                                    word
                                    count
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

export const CommentsQueryWrapper = ({
    block,
    queryOptions,
    question
}: { queryOptions: GetQueryProps } & CommentsCommonProps) => {
    const [data, setData] = useState<CommentsData>()
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
                const stats = questionData?.comments?.currentEdition?.commentsStats || []
                if (comments) {
                    setData({ comments, stats })
                }
            }
            setIsLoading(false)
        }

        getData()
    }, [])
    return (
        <div className="comments-wrapper">
            <div className="comments-wrapper-note">
                <T k="comments.description" />
            </div>

            <div className="comments-main">
                {isLoading ? (
                    <div>Loading…</div>
                ) : error ? (
                    <div className="error">
                        <code>{error?.message}</code>
                    </div>
                ) : data ? (
                    <Comments
                        comments={data?.comments}
                        stats={data?.stats}
                        block={block}
                        question={question}
                        sectionId={sectionId}
                    />
                ) : (
                    <div className="error">
                        <code>Could not load data</code>
                    </div>
                )}
            </div>
        </div>
    )
}
