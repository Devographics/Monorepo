import React from 'react'
import T from 'core/i18n/T'
import { FiltersTop_, Description_, Wrapper_ } from './FiltersSelection'
import { Options_, Option_ } from './Options'
import cloneDeep from 'lodash/cloneDeep'
import { FilterItem, PanelState } from './types'
import { ItemSelectOptions } from './condition/FieldSegment'
import { BlockVariantDefinition } from 'core/types'

// NOTE: we shouldn't need to disable any facet if we limit legend to facets that actually
// have data and use proper default cutoff

// disable facets with too many segments
// const disabledFacets = ['source', 'country', 'industry_sector']

const disabledFacets = []

interface FacetSelectionProps {
    block: BlockVariantDefinition
    allFilters: FilterItem[]
    stateStuff: PanelState
    axisIndex: 1 | 2
}

const FacetSelection = ({ block, allFilters, stateStuff, axisIndex }: FacetSelectionProps) => {
    const { filtersState, setFiltersState } = stateStuff
    const enabledFacets = allFilters.filter(f => !disabledFacets.includes(f.id))

    return (
        <Wrapper_>
            <div className="filters-section">
                <div className="filters-section-controls">
                    <div className="filters-section-description">
                        <T k={`filters.axis${axisIndex}.description`} html={true} md={true} />{' '}
                    </div>
                    <label>
                        {/* <T k="filters.facet" />{' '} */}
                        <select
                            onChange={e => {
                                const value = e.target.value
                                setFiltersState(fState => {
                                    const newState = cloneDeep(fState)
                                    const field = allFilters.find(f => f.id === value) as FilterItem
                                    newState[`axis${axisIndex}`] = {
                                        sectionId: field.sectionId,
                                        id: value
                                    }
                                    return newState
                                })
                            }}
                            value={filtersState[`axis${axisIndex}`]?.id}
                            defaultValue={''}
                        >
                            <ItemSelectOptions
                                currentQuestionId={block.fieldId || block.id}
                                allFilters={enabledFacets}
                            />
                        </select>
                    </label>
                </div>

                {/* <div className="filters-section-image">
                    <FacetsImage />
                    <figcaption>
                        <T k="filters.facet_view" />
                    </figcaption>
                </div> */}
            </div>
        </Wrapper_>
    )
}

const FacetsImage = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentCOlor" viewBox="0 0 120 60">
            <path d="M0 0H22.737V4H0z"></path>
            <path d="M27.79 0H60.632V4H27.79z"></path>
            <path d="M65.684 0H120V4H65.684z"></path>
            <path d="M48 14H73.263V18H48z"></path>
            <path d="M0 14H12.632V18H0z"></path>
            <path d="M17.684 14H42.947V18H17.684z"></path>
            <path d="M78.316 14H120V18H78.316z"></path>
            <path d="M0 28H32.842V32H0z"></path>
            <path d="M37.895 28H60.632000000000005V32H37.895z"></path>
            <path d="M66.947 28H102.315V32H66.947z"></path>
            <path d="M106.105 28H120V32H106.105z"></path>
            <path d="M0 42H51.789V46H0z"></path>
            <path d="M56.842 42H92.21000000000001V46H56.842z"></path>
            <path d="M97.263 42H120V46H97.263z"></path>
            <path d="M120 57v1H0v-1h120z"></path>
            <path d="M0 55h1v5H0v-5zM24 55h1v5h-1v-5zM119 55h1v5h-1v-5zM96 55h1v5h-1v-5zM72 55h1v5h-1v-5zM48 55h1v5h-1v-5z"></path>
        </svg>
    )
}

export default FacetSelection
