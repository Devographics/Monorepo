import React from 'react'
import { useTheme } from 'styled-components'
import T from 'core/i18n/T'
import newGithubIssueUrl from 'new-github-issue-url'
import {
    Comment,
    FeaturesOptions,
    OptionMetadata,
    QuestionMetadata,
    SimplifiedSentimentOptions
} from '@devographics/types'
import { getExperienceKey, getSentimentKey } from 'core/charts/multiItemsExperience/MultiItemsCell'
import './Comments.scss'
import { useI18n } from '@devographics/react-i18n'
import { getItemLabel } from 'core/helpers/labels'
import { CommentsFiltersState } from './Comments'

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

export const CommentItem = ({
    message,
    experience,
    sentiment,
    responseId,
    responseValue,
    index,
    question,
    name,
    stateStuff
}: Comment & {
    name: string
    index: number
    question: QuestionMetadata
    stateStuff: CommentsFiltersState
}) => {
    const { keywordFilter } = stateStuff
    // extract any options that were inlcuded in the user's corresponding response
    const responseValueArray = Array.isArray(responseValue) ? responseValue : [responseValue]
    const questionOptions =
        question?.options?.filter(o => responseValueArray.map(String).includes(String(o.id))) || []

    let formattedMessage = message.replaceAll('\n', '<br/>')

    if (keywordFilter) {
        formattedMessage = formattedMessage.replaceAll(
            keywordFilter,
            `<span class="highlight">${keywordFilter}</span>`
        )
    }

    return (
        <div className="comment-item">
            <div className="comment-message-wrapper">
                <div className="comment-quote">“</div>
                <div className="comment-index">#{index + 1}</div>
                <div
                    className="comment-message"
                    dangerouslySetInnerHTML={{ __html: formattedMessage }}
                />
            </div>
            <div className="comment-footer">
                {experience ? (
                    <div className="comment-response">
                        <ExperienceItem experience={experience} />
                        {sentiment && sentiment !== 'neutral' && (
                            <SentimentItem sentiment={sentiment} />
                        )}
                    </div>
                ) : questionOptions.length > 0 ? (
                    <div className="comment-response">
                        {questionOptions.map(option => (
                            <ValueItem key={option.id} option={option} question={question} />
                        ))}
                    </div>
                ) : null}
                <a
                    className="comment-report-link"
                    href={getCommentReportUrl({ responseId, message, name })}
                >
                    <T k="comments.report_abuse" />
                </a>
            </div>
        </div>
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
