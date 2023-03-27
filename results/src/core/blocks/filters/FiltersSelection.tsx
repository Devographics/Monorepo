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
import { BlockDefinition } from 'core/types'

interface FiltersSelectionProps {
    allFilters: FilterItem[]
    block: BlockDefinition
    stateStuff: PanelState
}

const FiltersSelection = ({ allFilters, block, stateStuff }: FiltersSelectionProps) => {
    const context = usePageContext()
    const { currentEdition } = context
    const { filtersState, setFiltersState } = stateStuff

    const canAddSeries = (filtersState?.filters?.length || 0) < maxSeriesCount

    const emptySeries = getNewSeries({
        filters: allFilters,
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
            <FiltersTop_>
                <Description_>
                    <T k="filters.filters.description" html={true} md={true} />
                </Description_>
            </FiltersTop_>
            <Presets stateStuff={stateStuff} />
            <SeriesList_>
                <Options filtersState={filtersState} setFiltersState={setFiltersState} />
                {filtersState?.filters?.map((series: CustomizationFiltersSeries, index: number) => (
                    <Series
                        key={index}
                        series={series}
                        index={index}
                        allFilters={allFilters}
                        stateStuff={stateStuff}
                    />
                ))}
                {canAddSeries && (
                    <EmptySeries_>
                        <Button size="small" onClick={handleAddSeries}>
                            <T k="filters.series.add" />
                        </Button>
                    </EmptySeries_>
                )}
            </SeriesList_>
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

export default FiltersSelection
