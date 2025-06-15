import React from 'react'
import Series from './Series'
import styled from 'styled-components'
import T from 'core/i18n/T'
import { spacing } from 'core/theme'
import Button from 'core/components/Button'
import cloneDeep from 'lodash/cloneDeep.js'
import { getNewSeries } from './helpers'
import { maxSeriesCount } from './constants'
import { usePageContext } from 'core/helpers/pageContext'
import { Series_ } from './Series'
import Presets from './Presets'
import Options from './Options'
import {
    CustomizationDefinition,
    PanelState,
    CustomizationFiltersSeries,
    FilterItem
} from './types'
import { BlockVariantDefinition } from 'core/types'

interface FiltersSelectionProps {
    allFilters: FilterItem[]
    block: BlockVariantDefinition
    stateStuff: PanelState
}

const FiltersSelection = ({ allFilters, block, stateStuff }: FiltersSelectionProps) => {
    const context = usePageContext()
    const { currentEdition } = context
    const { filtersState, setFiltersState } = stateStuff

    const canAddSeries = (filtersState?.filters?.length || 0) < maxSeriesCount

    const emptySeries = getNewSeries({
        filtersState,
        allFilters,
        year: currentEdition.year
    })

    const handleAddSeries = () => {
        setFiltersState((fState: CustomizationDefinition) => {
            const newState = cloneDeep(fState)
            newState.filters = [...(newState.filters || []), emptySeries]
            return newState
        })
    }
    return (
        <Wrapper_>
            <div className="filters-section">
                <div className="filters-section-controls">
                    <div className="filters-section-description">
                        <T k="filters.filters.description" html={true} md={true} />
                    </div>
                    {/* <Presets stateStuff={stateStuff} /> */}
                    <SeriesList_>
                        {/* <Options filtersState={filtersState} setFiltersState={setFiltersState} /> */}
                        {filtersState?.filters?.map(
                            (series: CustomizationFiltersSeries, index: number) => (
                                <Series
                                    key={index}
                                    series={series}
                                    index={index}
                                    allFilters={allFilters}
                                    stateStuff={stateStuff}
                                    block={block}
                                />
                            )
                        )}
                        {canAddSeries && (
                            <EmptySeries_>
                                <Button size="small" onClick={handleAddSeries}>
                                    <T k="filters.series.add" />
                                </Button>
                            </EmptySeries_>
                        )}
                    </SeriesList_>
                </div>
                {/* <div className="filters-section-image">
                    <FiltersImage />
                    <figcaption>
                        <T k="filters.grid_view" />
                    </figcaption>
                </div> */}
            </div>
        </Wrapper_>
    )
}

export const Wrapper_ = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing()};
`

export const Description_ = styled.div`
    p:last-child {
        margin: 0;
    }
`

export const FiltersTop_ = styled.div``

const SeriesList_ = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing()};
`

const EmptySeries_ = styled(Series_)`
    display: grid;
    place-items: center;
    padding: ${spacing()};
`

const FiltersImage = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 120 60">
            {' '}
            <path d="M50 57v1H0v-1h50zM120 57v1H70v-1h50z"></path>
            <path d="M0 55h1v5H0v-5zM70 55h1v5h-1v-5zM24 55h1v5h-1v-5zM93 55h1v5h-1v-5zM49 55h1v5h-1v-5zM119 55h1v5h-1v-5z"></path>
            <path d="M0 0H18.333V4H0z"></path>
            <path d="M0 14H26.667V18H0z"></path>
            <path d="M0 28H31.667V32H0z"></path>
            <path d="M0 42H50V46H0z"></path>
            <path d="M70 0H120V4H70z"></path>
            <path d="M70 14H110V18H70z"></path>
            <path d="M70 42H93.333V46H70z"></path>
            <path d="M70 28H101.667V32H70z"></path>
        </svg>
    )
}

export default FiltersSelection
