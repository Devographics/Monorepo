import React, { useEffect, useState } from 'react'
import T from 'core/i18n/T'
import { runQuery } from 'core/explorer/data'
import { RawDataItem, StandardQuestionData, Bucket } from '@devographics/types'
import { FreeformAnswers } from './FreeformAnswers'
import { BlockVariantDefinition } from 'core/types'
import { CommentsCommonProps } from '../comments/types'
import { FreeformAnswersData } from './types'

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
                            rawDataStats(token: "${token}") {
                                count
                                word
                            }
                        }
                    }
                }
            }
        }
    }
}`
}

export const FreeformAnswersQueryWrapper = ({
    queryOptions,
    questionLabel,
    buckets,
    tokenLabel,
    question,
    block
}: {
    queryOptions: GetQueryProps
    buckets: Bucket[]
    questionLabel: string
    tokenLabel: string
} & CommentsCommonProps) => {
    const [data, setData] = useState<FreeformAnswersData>()
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
            const rawDataStats = questionData?.freeform?.rawDataStats || []
            if (rawData) {
                setData({ answers: rawData, stats: rawDataStats })
            }

            setIsLoading(false)
        }

        getData()
    }, [])

    return (
        <div className="comments-wrapper">
            <div className="comments-wrapper-note">
                <T k="answers.description" values={{ name: tokenLabel }} md={true} />
            </div>
            <div>
                {isLoading ? (
                    <div>Loading…</div>
                ) : data ? (
                    <FreeformAnswers
                        answers={data?.answers}
                        stats={data?.stats}
                        questionLabel={questionLabel}
                        tokenLabel={tokenLabel}
                        block={block}
                        question={question}
                        buckets={buckets}
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
