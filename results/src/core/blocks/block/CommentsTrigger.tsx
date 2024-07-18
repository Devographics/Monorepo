import React, { useState, useEffect } from 'react'
import styled, { useTheme } from 'styled-components'
import ModalTrigger from 'core/components/ModalTrigger'
import T from 'core/i18n/T'
import { secondaryFontMixin, spacing } from 'core/theme'
import { CommentIcon } from 'core/icons'
import { runQuery } from 'core/explorer/data'
import newGithubIssueUrl from 'new-github-issue-url'
import { usePageContext } from 'core/helpers/pageContext'
import { useBlockTitle } from 'core/helpers/blockHelpers'
import {
    AllQuestionData,
    Comment,
    FeaturesOptions,
    SimplifiedSentimentOptions,
    StandardQuestionData
} from '@devographics/types'
import { getExperienceKey, getSentimentKey } from 'core/charts/multiItemsExperience/MultiItemsCell'
import './CommentsTrigger.scss'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'
import { BlockVariantDefinition } from 'core/types'

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

const CommentsTrigger = ({
    block,
    originalData = {}
}: {
    block: BlockVariantDefinition
    originalData: any
}) => {
    const title = useBlockTitle({ block })
    const pageContext = usePageContext()

    const surveyId = pageContext.currentSurvey.id
    const editionId = pageContext.currentEdition.id
    const sectionId = pageContext.id
    const questionId = block.id
    const queryOptions = { surveyId, editionId, sectionId, questionId }
    return (
        <ModalTrigger
            trigger={
                <span>
                    <CommentIcon enableTooltip={true} labelId="comments.comments" />
                    <CommentCount>{originalData?.comments?.currentEdition?.count}</CommentCount>
                </span>
            }
        >
            <CommentsWrapper queryOptions={queryOptions} name={title} />
        </ModalTrigger>
    )
}

export const CommentsWrapper = ({
    queryOptions,
    name
}: {
    queryOptions: GetQueryProps
    name: string
}) => {
    const [data, setData] = useState<Comment[]>([])
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
            const comments = questionData?.comments?.currentEdition?.commentsRaw
            if (comments) {
                setData(comments)
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
            <div>{isLoading ? <div>Loading…</div> : <Comments comments={data} name={name} />}</div>
        </div>
    )
}

const Comments = ({ comments, name }: { comments: Comment[]; name: string }) => {
    const [experienceFilter, setExperienceFilter] = useState<FeaturesOptions | null>(null)
    const [sentimentFilter, setSentimentFilter] = useState<SimplifiedSentimentOptions | null>(null)

    let filteredComments = comments
    if (experienceFilter) {
        filteredComments = filteredComments.filter(c => c.experience === experienceFilter)
    }
    if (sentimentFilter) {
        filteredComments = filteredComments.filter(c => c.sentiment === sentimentFilter)
    }
    return (
        <div>
            <div className="comments-header">
                <div className="comments-filter">
                    <T k="comments.filter.experience" />
                    <ButtonGroup>
                        <Button
                            size="small"
                            className={experienceFilter ? '' : 'Button--selected'}
                            onClick={() => {
                                setExperienceFilter(null)
                            }}
                        >
                            <T k="comments.filter.all" />
                        </Button>
                        {Object.values(FeaturesOptions).map(option => (
                            <Button
                                size="small"
                                className={experienceFilter === option ? 'Button--selected' : ''}
                                key={option}
                                onClick={() => {
                                    setExperienceFilter(option)
                                }}
                            >
                                <T k={`options.features.${option}.label.short`} />
                            </Button>
                        ))}
                    </ButtonGroup>
                </div>
                <div className="comments-filter">
                    <T k="comments.filter.sentiment" />
                    <ButtonGroup>
                        <Button
                            size="small"
                            className={sentimentFilter ? '' : 'Button--selected'}
                            onClick={() => {
                                setSentimentFilter(null)
                            }}
                        >
                            <T k="comments.filter.all" />
                        </Button>
                        {Object.values(SimplifiedSentimentOptions).map(option => (
                            <Button
                                size="small"
                                className={sentimentFilter === option ? 'Button--selected' : ''}
                                key={option}
                                onClick={() => {
                                    setSentimentFilter(option)
                                }}
                            >
                                <T k={`options.sentiment.${option}.label.short`} />
                            </Button>
                        ))}
                    </ButtonGroup>
                </div>
            </div>
            <CommentsList>
                {filteredComments?.map((comment, i) => (
                    <CommentItem key={i} index={i} {...comment} name={name} />
                ))}
            </CommentsList>
        </div>
    )
}

export const getCommentReportUrl = ({
    responseId,
    message,
    name
}: {
    responseId: string
    message: string
    name: string
}) => {
    return newGithubIssueUrl({
        user: 'devographics',
        repo: 'surveys',
        title: `[Comment Report] ${name} / ${responseId}`,
        labels: ['reported comment'],
        body: `Please explain below why you think this comment should be deleted. \n\n ### Reported Comment \n\n - question: ${name} \n - comment ID: ${responseId} \n - comment: \n\n > ${message} \n\n ### Your Report \n\n --explain why you're reporting this comment here--`
    })
}

const ExperienceItem = ({ experience }: { experience: FeaturesOptions }) => {
    const theme = useTheme()
    const experienceKey = getExperienceKey(experience)
    const style = { '--color': theme?.colors?.ranges?.features?.[experience]?.[0] }
    return (
        <span style={style} className={`experience-item experience-item-${experience}`}>
            <T k={experienceKey} />
        </span>
    )
}

const SentimentItem = ({
    experience,
    sentiment
}: {
    experience: FeaturesOptions
    sentiment: SimplifiedSentimentOptions
}) => {
    const theme = useTheme()

    const sentimentKey = getSentimentKey(experience, sentiment)
    const style = { '--color': theme?.colors?.ranges?.sentiment?.[sentiment]?.[0] }
    return (
        <span style={style} className={`sentiment-item sentiment-item-${sentiment}`}>
            <T k={sentimentKey} />
        </span>
    )
}

const CommentItem = ({
    message,
    experience,
    sentiment,
    responseId,
    index,
    name
}: Comment & { name: string; index: number }) => {
    return (
        <CommentItem_>
            <CommentMessageWrapper>
                <CommentQuote>“</CommentQuote>
                <CommentIndex>#{index + 1}</CommentIndex>
                <CommentMessage>{message}</CommentMessage>
            </CommentMessageWrapper>
            <CommentFooter_>
                <CommentResponse_>
                    <ExperienceItem experience={experience} />
                    {sentiment !== 'neutral' && (
                        <SentimentItem experience={experience} sentiment={sentiment} />
                    )}
                </CommentResponse_>
                <CommentReportLink href={getCommentReportUrl({ responseId, message, name })}>
                    <T k="comments.report_abuse" />
                </CommentReportLink>
            </CommentFooter_>
        </CommentItem_>
    )
}

const CommentCount = styled.span`
    display: block;
    position: absolute;
    top: 3px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.6rem;
    font-weight: bold;
`

const CommentsList = styled.div`
    /* display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: ${spacing()};
    row-gap: ${spacing()}; */
`

export const CommentItem_ = styled.div`
    margin-bottom: ${spacing()};
`

export const CommentMessageWrapper = styled.div`
    border-radius: 5px;
    background: ${({ theme }) => theme.colors.backgroundAlt2};
    padding: ${spacing()};
    position: relative;
`

export const CommentIndex = styled.div`
    font-weight: bold;
    font-size: 1.8rem;
    position: absolute;
    text-align: right;
    top: 50%;
    transform: translateY(-50%);
    right: 15px;
    opacity: 0.15;
`

export const CommentQuote = styled.div`
    font-size: 6rem;
    position: absolute;
    top: 0px;
    left: 5px;
    line-height: 1;
    opacity: 0.15;
    ${secondaryFontMixin}
`

export const CommentMessage = styled.div``

export const CommentReportLink = styled.a`
    font-size: 0.7rem;
    margin-top: 3px;
    text-align: right;
    display: block;
`

export const CommentFooter_ = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
`

export const CommentResponse_ = styled.div`
    display: flex;
    gap: 10px;
    position: relative;
    top: -20px;
    left: 20px;
`

export default CommentsTrigger
