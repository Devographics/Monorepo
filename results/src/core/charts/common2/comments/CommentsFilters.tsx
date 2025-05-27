import React, { useState } from 'react'
import { Comment, QuestionMetadata, WordCount } from '@devographics/types'
import { CommentsFiltersState } from './types'
import T from 'core/i18n/T'
import Button from 'core/components/Button'
import { FilterKeywords } from './filters/FilterKeywords'
import { FilterSearch } from './filters/FilterSearch'
import { FilterOptions } from './filters/FilterOptions'
import { FilterExperience } from './filters/FilterExperience'
import { FilterSentiment } from './filters/FilterSentiment'

export const CommentsFilters = ({
    comments,
    allComments,
    question,
    stateStuff,
    stats
}: {
    comments: Comment[]
    allComments: Comment[]
    question: QuestionMetadata
    stateStuff: CommentsFiltersState
    stats: WordCount[]
}) => {
    const [showFiltersOnMobile, setShowFiltersOnMobile] = useState(false)
    // const optionsOrGroups = groups || options
    const isExperienceQuestion = ['featurev3', 'toolv3'].includes(question.template)

    return (
        <div
            className={`comments-filters-wrapper comments-filters-wrapper-${
                showFiltersOnMobile ? 'show' : 'hide'
            }`}
        >
            <div className="comments-filters">
                <FilterSearch stateStuff={stateStuff} />

                {isExperienceQuestion ? (
                    <>
                        <FilterExperience
                            comments={comments}
                            allComments={comments}
                            stateStuff={stateStuff}
                        />
                        <FilterSentiment
                            comments={comments}
                            allComments={comments}
                            stateStuff={stateStuff}
                        />
                    </>
                ) : question.options ? (
                    <FilterOptions
                        question={question}
                        allComments={allComments}
                        stateStuff={stateStuff}
                    />
                ) : null}

                {stats?.length > 0 && <FilterKeywords stateStuff={stateStuff} stats={stats} />}
            </div>
            <Button
                onClick={(e: any) => {
                    e.preventDefault()
                    setShowFiltersOnMobile(!showFiltersOnMobile)
                }}
            >
                <T k={`comments.filter.${showFiltersOnMobile ? 'hide' : 'show'}`} />
            </Button>
        </div>
    )
}

// <OrderToggle sort={sort} setSort={setSort} order={order} setOrder={setOrder} />

export const FilterSection = ({
    headingId,
    showClear,
    onClear,
    children
}: {
    headingId: string
    showClear: boolean
    onClear: () => void
    children: JSX.Element
}) => {
    return (
        <div className="filter-section">
            <div className="filter-section-heading">
                <h4 className="filter-heading">
                    <T k={`comments.filter.by_${headingId}`} />
                </h4>
                {showClear && (
                    <Button
                        size="small"
                        onClick={(e: any) => {
                            e.preventDefault()
                            onClear()
                        }}
                    >
                        <T k="comments.filter.clear" />
                    </Button>
                )}
            </div>

            <div className="filter-section-description">
                <T k={`comments.filter.by_${headingId}.description`} />
            </div>
            <div className="filter-section-items">{children}</div>
        </div>
    )
}
