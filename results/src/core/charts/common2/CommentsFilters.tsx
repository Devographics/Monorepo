import React from 'react'
import {
    Comment,
    FeaturesOptions,
    OptionId,
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
import { KeywordFilter, OrderToggle } from './FreeformAnswers'

type OptionToggleItems = {
    id: OptionId
    label: string
    isEnabled: boolean
}

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

    const { options } = question
    // const optionsOrGroups = groups || options
    const isExperienceQuestion = ['featurev3', 'toolv3'].includes(question.template)
    const {
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
    } = stateStuff

    if (isExperienceQuestion) {
        return (
            <div className="comments-header">
                <div className="comments-filter">
                    <KeywordFilter
                        keywordFilter={keywordFilter}
                        setKeywordFilter={setKeywordFilter}
                        items={comments}
                    />
                    <ExperienceSentimentFilters
                        comments={comments}
                        experienceFilter={experienceFilter}
                        setExperienceFilter={setExperienceFilter}
                        sentimentFilter={sentimentFilter}
                        setSentimentFilter={setSentimentFilter}
                    />
                </div>
                <OrderToggle sort={sort} setSort={setSort} order={order} setOrder={setOrder} />
            </div>
        )
    } else if (options) {
        const items: OptionToggleItems[] = options.map(option => {
            const { id, entity } = option
            const { shortLabel } = getItemLabel({
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
                    <KeywordFilter
                        keywordFilter={keywordFilter}
                        setKeywordFilter={setKeywordFilter}
                        items={comments}
                    />
                    <OptionsValuesFilters
                        items={items}
                        comments={comments}
                        valueFilter={valueFilter}
                        setValueFilter={setValueFilter}
                    />
                </div>
                <OrderToggle sort={sort} setSort={setSort} order={order} setOrder={setOrder} />
            </div>
        )
    } else {
        return null
    }
}

const ExperienceSentimentFilters = ({
    comments,
    experienceFilter,
    setExperienceFilter,
    sentimentFilter,
    setSentimentFilter
}: {
    comments: Comment[]
    experienceFilter: FeaturesOptions | null
    setExperienceFilter: React.Dispatch<React.SetStateAction<FeaturesOptions | null>>
    sentimentFilter: SimplifiedSentimentOptions | null
    setSentimentFilter: React.Dispatch<React.SetStateAction<SimplifiedSentimentOptions | null>>
}) => {
    const { getString } = useI18n()

    return (
        <div className="comments-filter">
            <Toggle
                labelId="comments.filter.experience"
                items={[
                    {
                        label: `${getString('comments.filter.all')?.t} (${comments.length})`,
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
            <Toggle
                labelId="comments.filter.sentiment"
                items={[
                    {
                        label: `${getString('comments.filter.all')?.t} (${comments.length})`,
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
    )
}

const OptionsValuesFilters = ({
    comments,
    items,
    valueFilter,
    setValueFilter
}: {
    comments: Comment[]
    items: OptionToggleItems[]
    valueFilter: string | null
    setValueFilter: React.Dispatch<React.SetStateAction<string | null>>
}) => {
    const { getString } = useI18n()

    return (
        <Toggle
            labelId="charts.filter_by"
            items={[
                {
                    label: `${getString('comments.filter.all')?.t} (${comments.length})`,
                    id: '',
                    isEnabled: valueFilter === null
                },
                ...items
            ]}
            handleSelect={id => {
                setValueFilter(id as string)
            }}
        />
    )
}
