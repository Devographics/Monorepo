import React from 'react'
import { Comment, FeaturesOptions, QuestionMetadata } from '@devographics/types'
import { useI18n } from '@devographics/react-i18n'
import { filterCommentsByExperience } from '../Comments'
import { CommentsFiltersState } from '../types'
import { FilterSection } from '../CommentsFilters'
import { FilterItem } from '../FilterItem'

export const FilterExperience = ({
    question,
    allComments,
    comments,
    stateStuff
}: {
    question: QuestionMetadata
    allComments: Comment[]
    comments: Comment[]
    stateStuff: CommentsFiltersState
}) => {
    const { experienceFilter, setExperienceFilter } = stateStuff
    const { getString } = useI18n()

    return (
        <FilterSection
            headingId="experience"
            showClear={experienceFilter !== null}
            onClear={() => {
                setExperienceFilter(null)
            }}
        >
            <>
                {Object.values(FeaturesOptions).map(id => {
                    const count = filterCommentsByExperience(allComments, id).length
                    return (
                        <FilterItem
                            key={id}
                            id={id}
                            question={question}
                            label={getString(`options.features.${id}.label.short`)?.t}
                            count={count}
                            isActive={id === experienceFilter}
                            clickHandler={() => {
                                setExperienceFilter(id)
                            }}
                        />
                    )
                })}
            </>
        </FilterSection>
    )
}
