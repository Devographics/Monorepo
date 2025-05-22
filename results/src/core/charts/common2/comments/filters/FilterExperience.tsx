import React from 'react'
import { Comment, FeaturesOptions } from '@devographics/types'
import { Toggle } from 'core/charts/common2'
import { useI18n } from '@devographics/react-i18n'
import { filterCommentsByExperience } from '../Comments'
import { CommentsFiltersState } from '../types'
import { FilterSection } from '../CommentsFilters'

export const FilterExperience = ({
    allComments,
    comments,
    stateStuff
}: {
    allComments: Comment[]
    comments: Comment[]
    stateStuff: CommentsFiltersState
}) => {
    const { experienceFilter, setExperienceFilter } = stateStuff
    const { getString } = useI18n()

    return (
        <FilterSection
            headingId="experience"
            showClear={false}
            onClear={() => {
                return
            }}
        >
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
                            filterCommentsByExperience(allComments, id).length
                        })`,
                        isEnabled: id === experienceFilter
                    }))
                ]}
                handleSelect={id => {
                    setExperienceFilter(id as FeaturesOptions)
                }}
            />
        </FilterSection>
    )
}
