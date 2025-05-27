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
import { useI18n } from '@devographics/react-i18n'
import { getItemLabel } from 'core/helpers/labels'
import { CommentsFiltersState } from './types'
import { escapeRegExp } from './Comments'
import { CommentsItemWrapper } from './CommentsItemWrapper'

export const getCommentReportUrl = ({
    responseId,
    message,
    questionLabel
}: {
    responseId: string
    message: string
    questionLabel: string
}) => {
    return newGithubIssueUrl({
        user: 'devographics',
        repo: 'surveys',
        title: `[Comment Report] ${questionLabel} / ${responseId}`,
        labels: ['reported comment'],
        body: `Please explain below why you think this comment should be deleted. \n\n ### Reported Comment \n\n - question: ${questionLabel} \n - comment ID: ${responseId} \n - comment: \n\n > ${message} \n\n ### Your Report \n\n --explain why you're reporting this comment here--`
    })
}

export function highlightWordStarts(text: string, word: string): string {
    if (!word) return text

    const escaped = escapeRegExp(word)
    const regex = new RegExp(`\\b(${escaped}\\w*)`, 'gi')

    return text.replace(regex, '<mark>$1</mark>')
}

export const CommentItem = ({
    message,
    experience,
    sentiment,
    responseId,
    responseValue,
    index,
    question,
    questionLabel,
    stateStuff
}: Comment & {
    questionLabel: string
    index: number
    question: QuestionMetadata
    stateStuff: CommentsFiltersState
}) => {
    const { keywordFilter, searchFilter } = stateStuff
    // extract any options that were inlcuded in the user's corresponding response
    const responseValueArray = Array.isArray(responseValue) ? responseValue : [responseValue]
    const questionOptions =
        question?.options?.filter(o => responseValueArray.map(String).includes(String(o.id))) || []

    let formattedMessage = message.replaceAll('\n', '<br/>')

    if (keywordFilter) {
        formattedMessage = highlightWordStarts(formattedMessage, keywordFilter)
    }
    if (searchFilter) {
        formattedMessage = highlightWordStarts(formattedMessage, searchFilter)
    }

    return (
        <CommentsItemWrapper
            index={index}
            contents={formattedMessage}
            answer={
                experience ? (
                    <>
                        <ExperienceItem experience={experience} />
                        {sentiment && sentiment !== 'neutral' && (
                            <SentimentItem sentiment={sentiment} />
                        )}
                    </>
                ) : questionOptions.length > 0 ? (
                    <>
                        {' '}
                        {questionOptions.map(option => (
                            <ValueItem
                                key={option.id}
                                option={option}
                                question={question}
                                stateStuff={stateStuff}
                            />
                        ))}
                    </>
                ) : null
            }
            reportLink={getCommentReportUrl({ responseId, message, questionLabel })}
        />
    )
}

const ValueItem = ({
    option,
    question,
    stateStuff
}: {
    option: OptionMetadata
    question: QuestionMetadata
    stateStuff: CommentsFiltersState
}) => {
    const { setValueFilter } = stateStuff
    const { getString } = useI18n()
    const { id, entity } = option
    const { label, shortLabel, key } = getItemLabel({
        id,
        entity,
        getString,
        i18nNamespace: question.id
    })
    return (
        <button
            className="value-item"
            onClick={e => {
                e.preventDefault()
                setValueFilter(id)
            }}
        >
            {shortLabel}
        </button>
    )
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
