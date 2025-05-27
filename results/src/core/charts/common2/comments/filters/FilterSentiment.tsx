import React from 'react'
import { Comment, SimplifiedSentimentOptions } from '@devographics/types'
import { useI18n } from '@devographics/react-i18n'
import { CommentsFiltersState } from '../types'
import { FilterSection } from '../CommentsFilters'
import { filterCommentsBySentiment } from '../Comments'
import { FilterItem } from '../FilterItem'

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
            showClear={sentimentFilter !== null}
            onClear={() => {
                setSentimentFilter(null)
            }}
        >
            <>
                {Object.values(SimplifiedSentimentOptions).map(id => {
                    const count = filterCommentsBySentiment(allComments, id).length
                    return (
                        <FilterItem
                            key={id}
                            label={getString(`options.sentiment.${id}.label.short`)?.t}
                            count={count}
                            isActive={id === sentimentFilter}
                            clickHandler={() => {
                                setSentimentFilter(id)
                            }}
                        />
                    )
                })}
            </>
        </FilterSection>
    )
}
