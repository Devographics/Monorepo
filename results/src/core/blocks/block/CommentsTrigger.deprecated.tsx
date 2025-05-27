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
    Comment,
    FeaturesOptions,
    OptionMetadata,
    QuestionMetadata,
    SimplifiedSentimentOptions,
    StandardQuestionData
} from '@devographics/types'
import { getExperienceKey, getSentimentKey } from 'core/charts/multiItemsExperience/MultiItemsCell'
import './CommentsTrigger.scss'
import { BlockVariantDefinition } from 'core/types'
import { Toggle } from 'core/charts/common2'
import { useI18n } from '@devographics/react-i18n'
import { getItemLabel } from 'core/helpers/labels'

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

/**
 * @deprecated only used by old chart layout
 */
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
            <div>
                {isLoading ? (
                    <div>Loading…</div>
                ) : (
                    <Comments comments={data} name={name} question={question} />
                )}
            </div>
        </div>
    )
}

const filterCommentsByValue = (comments: Comment[], value: string | number | null) =>
    value === null ? comments : comments.filter(c => String(c.responseValue) === String(value))

const Comments = ({
    comments,
    name,
    question
}: {
    comments: Comment[]
} & CommentsCommonProps) => {
    const [experienceFilter, setExperienceFilter] = useState<FeaturesOptions | null>(null)
    const [sentimentFilter, setSentimentFilter] = useState<SimplifiedSentimentOptions | null>(null)
    const [valueFilter, setValueFilter] = useState<string | null>(null)

    const stateStuff = {
        experienceFilter,
        setExperienceFilter,
        sentimentFilter,
        setSentimentFilter,
        valueFilter,
        setValueFilter
    }

    let filteredComments = comments
    if (experienceFilter) {
        filteredComments = filteredComments.filter(c => c.experience === experienceFilter)
    }
    if (sentimentFilter) {
        filteredComments = filteredComments.filter(c => c.sentiment === sentimentFilter)
    }
    filteredComments = filterCommentsByValue(filteredComments, valueFilter)
    return (
        <div>
            <CommentsFilters comments={comments} question={question} stateStuff={stateStuff} />

            <CommentsList>
                {filteredComments?.map((comment, i) => (
                    <CommentItem key={i} index={i} {...comment} name={name} question={question} />
                ))}
            </CommentsList>
        </div>
    )
}

interface CommentsFiltersState {
    experienceFilter: FeaturesOptions | null
    setExperienceFilter: React.Dispatch<React.SetStateAction<FeaturesOptions | null>>
    sentimentFilter: SimplifiedSentimentOptions | null
    setSentimentFilter: React.Dispatch<React.SetStateAction<SimplifiedSentimentOptions | null>>
    valueFilter: string | null
    setValueFilter: React.Dispatch<React.SetStateAction<string | null>>
}

const CommentsFilters = ({
    comments,
    question,
    stateStuff
}: {
    comments: Comment[]
    question: QuestionMetadata
    stateStuff: CommentsFiltersState
}) => {
    const { getString } = useI18n()

    const { options, groups, i18nNamespace } = question
    // const optionsOrGroups = groups || options
    const isExperienceQuestion = ['featurev3', 'toolv3'].includes(question.template)
    const {
        experienceFilter,
        setExperienceFilter,
        sentimentFilter,
        setSentimentFilter,
        valueFilter,
        setValueFilter
    } = stateStuff
    if (isExperienceQuestion) {
        return (
            <div className="comments-header">
                <div className="comments-filter">
                    <Toggle
                        labelId="comments.filter.experience"
                        items={[
                            {
                                label: getString('comments.filter.all')?.t,
                                id: null,
                                isEnabled: experienceFilter === null
                            },
                            ...Object.values(FeaturesOptions).map(id => ({
                                id,
                                label: getString(`options.features.${id}.label.short`)?.t,
                                isEnabled: id === experienceFilter
                            }))
                        ]}
                        handleSelect={id => {
                            setExperienceFilter(id as FeaturesOptions)
                        }}
                    />
                </div>
                <div className="comments-filter">
                    <Toggle
                        labelId="comments.filter.sentiment"
                        items={[
                            {
                                label: getString('comments.filter.all')?.t,
                                id: null,
                                isEnabled: sentimentFilter === null
                            },
                            ...Object.values(SimplifiedSentimentOptions).map(id => ({
                                id,
                                label: getString(`options.sentiment.${id}.label.short`)?.t,
                                isEnabled: id === sentimentFilter
                            }))
                        ]}
                        handleSelect={id => {
                            setSentimentFilter(id as SimplifiedSentimentOptions)
                        }}
                    />
                </div>
            </div>
        )
    } else if (options) {
        const items = options.map(option => {
            const { id, entity } = option
            const { label, shortLabel, key } = getItemLabel({
                id,
                entity,
                getString,
                i18nNamespace: question.id
            })
            return {
                id: option.id,
                label: `${shortLabel} (${filterCommentsByValue(comments, option.id).length})`,
                isEnabled: option.id === valueFilter
            }
        })

        return (
            <div className="comments-header">
                <div className="comments-filter">
                    <Toggle
                        labelId="charts.filter_by"
                        items={[
                            {
                                label: getString('comments.filter.all')?.t,
                                id: null,
                                isEnabled: valueFilter === null
                            },
                            ...items
                        ]}
                        handleSelect={id => {
                            setValueFilter(id)
                        }}
                    />
                </div>
            </div>
        )
    } else {
        return null
    }
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

const CommentItem = ({
    message,
    experience,
    sentiment,
    responseId,
    responseValue,
    index,
    question,
    name
}: Comment & { name: string; index: number; question: QuestionMetadata }) => {
    const option = question?.options?.find(o => String(o.id) === String(responseValue))
    return (
        <CommentItem_>
            <CommentMessageWrapper>
                <CommentQuote>“</CommentQuote>
                <CommentIndex>#{index + 1}</CommentIndex>
                <CommentMessage>{message}</CommentMessage>
            </CommentMessageWrapper>
            <CommentFooter_>
                {experience ? (
                    <CommentResponse_>
                        <ExperienceItem experience={experience} />
                        {sentiment && sentiment !== 'neutral' && (
                            <SentimentItem sentiment={sentiment} />
                        )}
                    </CommentResponse_>
                ) : option !== undefined ? (
                    <CommentResponse_>
                        <ValueItem option={option} question={question} />
                    </CommentResponse_>
                ) : null}
                <CommentReportLink href={getCommentReportUrl({ responseId, message, name })}>
                    <T k="comments.report_abuse" />
                </CommentReportLink>
            </CommentFooter_>
        </CommentItem_>
    )
}

const ValueItem = ({
    option,
    question
}: {
    option: OptionMetadata
    question: QuestionMetadata
}) => {
    const { getString } = useI18n()
    const { id, entity } = option
    const { label, shortLabel, key } = getItemLabel({
        id,
        entity,
        getString,
        i18nNamespace: question.id
    })
    return <span className="experience-item value-item">{shortLabel}</span>
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

const SentimentItem = ({ sentiment }: { sentiment: SimplifiedSentimentOptions }) => {
    const theme = useTheme()

    const sentimentKey = getSentimentKey(sentiment)
    const style = { '--color': theme?.colors?.ranges?.sentiment?.[sentiment]?.[0] }
    return (
        <span style={style} className={`sentiment-item sentiment-item-${sentiment}`}>
            <T k={sentimentKey} />
        </span>
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
