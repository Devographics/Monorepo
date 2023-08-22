import React from 'react'
import T from 'core/i18n/T'
import { FiltersTop_, Description_, Wrapper_ } from './FiltersSelection'
import { Options_, Option_ } from './Options'
import cloneDeep from 'lodash/cloneDeep'
import { FilterItem, PanelState } from './types'
import { ItemSelectOptions } from './condition/FieldSegment'
import { BlockDefinition } from 'core/types'

// disable facets with too many segments
const disabledFacets = ['source', 'country', 'industry_sector']

interface FacetSelectionProps {
    block: BlockDefinition
    allFilters: FilterItem[]
    stateStuff: PanelState
}

const FacetSelection = ({ block, allFilters, stateStuff }: FacetSelectionProps) => {
    const { filtersState, setFiltersState } = stateStuff
    const enabledFacets = allFilters.filter(f => !disabledFacets.includes(f.id))

    return (
        <Wrapper_>
            <FiltersTop_>
                <Description_>
                    <T k="filters.facets.description" html={true} md={true} />
                </Description_>
            </FiltersTop_>
            <Options_>
                <Option_>
                    <label>
                        <T k="filters.facet" />{' '}
                        <select
                            onChange={e => {
                                const value = e.target.value
                                setFiltersState(fState => {
                                    const newState = cloneDeep(fState)
                                    const field = allFilters.find(f => f.id === value) as FilterItem
                                    newState.facet = { sectionId: field.sectionId, id: value }
                                    return newState
                                })
                            }}
                            value={filtersState?.facet?.id}
                            defaultValue=""
                        >
                            <ItemSelectOptions
                                currentQuestionId={block.fieldId || block.id}
                                allFilters={enabledFacets}
                            />
                        </select>
                    </label>
                </Option_>
            </Options_>
        </Wrapper_>
    )
}

export default FacetSelection
