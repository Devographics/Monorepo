import React from 'react'
import { FreeformAnswersState } from '../../freeform_answers/types'
import { FilterSection } from '../CommentsFilters'

export const FilterSearch = ({ stateStuff }: { stateStuff: FreeformAnswersState }) => {
    const { searchFilter, setSearchFilter } = stateStuff
    return (
        <FilterSection
            headingId="search"
            showClear={searchFilter !== null}
            onClear={() => {
                setSearchFilter(null)
            }}
        >
            <input
                type="text"
                value={searchFilter || ''}
                onChange={e => {
                    const value = e.target.value
                    setSearchFilter(value === '' ? null : value)
                }}
            />
        </FilterSection>
    )
}
