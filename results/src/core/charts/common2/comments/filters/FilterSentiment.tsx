import React from 'react'
import { Comment, SimplifiedSentimentOptions } from '@devographics/types'
import { Toggle } from 'core/charts/common2'
import { useI18n } from '@devographics/react-i18n'
import { CommentsFiltersState } from '../types'
import { FilterSection } from '../CommentsFilters'
import { filterCommentsBySentiment } from '../Comments'

export const FilterSentiment = ({
    allComments,
    comments,

    stateStuff
}: {
    allComments: Comment[]
    comments: Comment[]
    stateStuff: CommentsFiltersState
}) => {
    const { sentimentFilter, setSentimentFilter } = stateStuff
    const { getString } = useI18n()

    return (
        <FilterSection
            headingId="sentiment"
            showClear={false}
            onClear={() => {
                return
            }}
        >
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
                            filterCommentsBySentiment(allComments, id).length
                        })`,
                        isEnabled: id === sentimentFilter
                    }))
                ]}
                handleSelect={id => {
                    setSentimentFilter(id as SimplifiedSentimentOptions)
                }}
            />
        </FilterSection>
    )
}
