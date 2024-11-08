import React from 'react'
import {
    Comment,
    FeaturesOptions,
    QuestionMetadata,
    SimplifiedSentimentOptions
} from '@devographics/types'
import './Comments.scss'
import { Toggle } from 'core/charts/common2'
import { useI18n } from '@devographics/react-i18n'
import { getItemLabel } from 'core/helpers/labels'
import {
    CommentsFiltersState,
    filterCommentsByExperience,
    filterCommentsBySentiment,
    filterCommentsByValue
} from './Comments'

export const CommentsFilters = ({
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
                                label: `${getString('comments.filter.all')?.t} (${
                                    comments.length
                                })`,
                                id: '',
                                isEnabled: experienceFilter === null
                            },
                            ...Object.values(FeaturesOptions).map(id => ({
                                id,
                                label: `${getString(`options.features.${id}.label.short`)?.t} (${
                                    filterCommentsByExperience(comments, id).length
                                })`,
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
                                label: `${getString('comments.filter.all')?.t} (${
                                    comments.length
                                })`,
                                id: '',
                                isEnabled: sentimentFilter === null
                            },
                            ...Object.values(SimplifiedSentimentOptions).map(id => ({
                                id,
                                label: `${getString(`options.sentiment.${id}.label.short`)?.t} (${
                                    filterCommentsBySentiment(comments, id).length
                                })`,
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
                                label: `${getString('comments.filter.all')?.t} (${
                                    comments.length
                                })`,
                                id: '',
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
