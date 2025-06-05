import React from 'react'
import { WordCount } from '@devographics/types'
import take from 'lodash/take'
import { FilterItem } from '../FilterItem'
import { FreeformAnswersState } from '../../freeform_answers/types'
import { FilterSection } from '../CommentsFilters'

export const KEYWORD_COUNT = 20

export const FilterKeywords = ({
    stateStuff,
    stats
}: {
    stateStuff: FreeformAnswersState
    stats: WordCount[]
}) => {
    const { keywordFilter, setKeywordFilter } = stateStuff
    const allWords = stats.map(k => k.word)
    return (
        <FilterSection
            headingId="keyword"
            showClear={keywordFilter !== null && allWords.includes(keywordFilter)}
            onClear={() => {
                setKeywordFilter(null)
            }}
        >
            <>
                {take(stats, KEYWORD_COUNT).map(keyword => (
                    <FilterItem
                        key={keyword.word}
                        count={keyword.count}
                        label={keyword.word}
                        isActive={keyword.word === keywordFilter}
                        clickHandler={() => {
                            setKeywordFilter(keyword.word)
                        }}
                    />
                ))}
            </>
        </FilterSection>
    )
}
