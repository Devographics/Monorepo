import React, { useEffect, useState } from 'react'
import T from 'core/i18n/T'
import { runQuery } from 'core/explorer/data'
import { RawDataItem, StandardQuestionData, Bucket } from '@devographics/types'
import { FreeformAnswers } from './FreeformAnswers'
import { CommentsCommonProps } from '../comments/types'
import { getEntityFragmentContents } from 'core/queries'
import { RawDataQueryOptions } from './FreeformAnswersTrigger'

type GetQueryNameProps = {
    editionId: string
    questionId: string
    token: string
}
const getQueryName = ({ editionId, questionId, token }: GetQueryNameProps) =>
    `${editionId}${questionId}__${token}__RawDataQuery`

const getRawDataQuery = ({
    surveyId,
    editionId,
    sectionId,
    questionId,
    token,
    excludedTokens
}: RawDataQueryOptions) => {
    let excludedTokensString = ''
    if (excludedTokens && excludedTokens.length > 0) {
        const excludedTokensFormatted = excludedTokens?.map(t => `"${t}"`).join()
        excludedTokensString = `excludedTokens: [${excludedTokensFormatted}]`
    }
    return `
query ${getQueryName({ editionId, questionId, token })} {
    surveys {
        ${surveyId} {
            ${editionId} {
                ${sectionId} {
                    ${questionId} {
                        rawData(token: "${token}", ${excludedTokensString}) {
                            answers {
                                responseId
                                tokens {
                                    id
                                }
                                rawHtml
                            }
                            stats {
                                count
                                word
                            }
                            entities {
                                ${getEntityFragmentContents()}
                            }
                            tokens {
                                id
                                parentId
                                count
                                nameHtml
                                descriptionHtml
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
    block,
    defaultTokenFilter
}: {
    queryOptions: GetQueryProps
    buckets: Bucket[]
    questionLabel: string
    tokenLabel: string
    defaultTokenFilter?: string
} & CommentsCommonProps) => {
    const [data, setData] = useState<RawDataItem>()
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
            const query = getRawDataQuery(queryOptions)

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
            const answers = questionData?.rawData?.answers
            const stats = questionData?.rawData?.stats || []
            const entities = questionData?.rawData?.entities || []
            const tokens = questionData?.rawData?.tokens || []

            if (answers) {
                setData({ answers, stats, entities, tokens })
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
                        entities={data?.entities}
                        tokens={data?.tokens}
                        questionLabel={questionLabel}
                        tokenId={queryOptions.token}
                        tokenLabel={tokenLabel}
                        block={block}
                        question={question}
                        buckets={buckets}
                        defaultTokenFilter={defaultTokenFilter}
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
