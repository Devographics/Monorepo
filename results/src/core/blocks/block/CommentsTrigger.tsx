import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import ModalTrigger from 'core/components/ModalTrigger'
import T from 'core/i18n/T'
import { secondaryFontMixin, spacing } from 'core/theme'
import { CommentIcon } from 'core/icons'
import { runQuery } from 'core/explorer/data'
import newGithubIssueUrl from 'new-github-issue-url'
import { usePageContext } from 'core/helpers/pageContext'
import { useBlockTitle } from 'core/helpers/blockHelpers'
import { AllQuestionData } from '@devographics/types'

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

export const CommentsWrapper = ({ queryOptions, name }) => {
    const [data, setData] = useState()
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
            const { result, error } = await runQuery<AllQuestionData>(
                url,
                query,
                getQueryName(queryOptions)
            )
            const comments =
                result?.surveys[surveyId][editionId][sectionId][questionId].comments.currentEdition
                    .commentsRaw
            setData(comments)
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

const Comments = ({ comments, name }) => {
    return (
        <CommentsList>
            {comments?.map((comment, i) => (
                <Comment key={i} index={i} {...comment} name={name} />
            ))}
        </CommentsList>
    )
}

const getCommentReportUrl = ({ responseId, message, name }) => {
    return newGithubIssueUrl({
        user: 'devographics',
        repo: 'surveys',
        title: `[Comment Report] ${name} / ${responseId}`,
        labels: ['reported comment'],
        body: `Please explain below why you think this comment should be deleted. \n\n ### Reported Comment \n\n - question: ${name} \n - comment ID: ${responseId} \n - comment: \n\n > ${message} \n\n ### Your Report \n\n --explain why you're reporting this comment here--`
    })
}

const Comment = ({ message, responseId, index, name }) => {
    return (
        <CommentItem>
            <CommentMessageWrapper>
                <CommentQuote>“</CommentQuote>
                <CommentIndex>#{index + 1}</CommentIndex>
                <CommentMessage>{message}</CommentMessage>
            </CommentMessageWrapper>
            <CommentReportLink href={getCommentReportUrl({ responseId, message, name })}>
                <T k="comments.report_abuse" />
            </CommentReportLink>
        </CommentItem>
    )
}

const CommentsTrigger = props => {
    const { block } = props
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
                    <CommentCount>
                        {props?.originalData?.comments?.currentEdition?.count}
                    </CommentCount>
                </span>
            }
        >
            <CommentsWrapper queryOptions={queryOptions} name={title} />
        </ModalTrigger>
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

const CommentItem = styled.div`
    margin-bottom: ${spacing()};
`

const CommentMessageWrapper = styled.div`
    border-radius: 5px;
    background: ${({ theme }) => theme.colors.backgroundAlt2};
    padding: ${spacing()};
    position: relative;
`

const CommentIndex = styled.div`
    font-weight: bold;
    font-size: 1.8rem;
    position: absolute;
    text-align: right;
    top: 50%;
    transform: translateY(-50%);
    right: 15px;
    opacity: 0.15;
`

const CommentQuote = styled.div`
    font-size: 6rem;
    position: absolute;
    top: 0px;
    left: 5px;
    line-height: 1;
    opacity: 0.15;
    ${secondaryFontMixin}
`

const CommentMessage = styled.div``

const CommentReportLink = styled.a`
    font-size: 0.6rem;
    margin-top: 3px;
    text-align: right;
    display: block;
`

export default CommentsTrigger
