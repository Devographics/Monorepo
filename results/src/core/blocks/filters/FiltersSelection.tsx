import React, { useEffect } from 'react'
import Series from './Series'
import styled from 'styled-components'
import T from 'core/i18n/T'
import { mq, spacing, fontSize } from 'core/theme'
import Button from 'core/components/Button'
import cloneDeep from 'lodash/cloneDeep.js'
import { getNewSeries } from './helpers'
import { maxSeriesCount, MODE_GRID } from './constants'
import { usePageContext } from 'core/helpers/pageContext'
import { useI18n } from 'core/i18n/i18nContext'
import { Series_ } from './Series'
import Presets from './Presets'
import Options from './Options'
import { useAllChartsOptionsIdsOnly } from 'core/charts/hooks'

const FiltersSelection = ({ chartName, block, stateStuff }) => {
    const context = usePageContext()
    const allChartsKeys = useAllChartsOptionsIdsOnly()
    const { currentEdition } = context
    const { filtersState, setFiltersState } = stateStuff

    const canAddSeries = filtersState.filters.length < maxSeriesCount

    const availableFilters = allChartsKeys.filters
    
    const filtersWithoutCurrentItem = availableFilters.filter(f => f !== block.id)

    const emptySeries = getNewSeries({
        filters: filtersWithoutCurrentItem,
        keys: allChartsKeys,
        year: currentEdition.year
    })

    // whenever this panel is loaded, set mode to filters
    useEffect(() => {
        setFiltersState(fState => {
            const newState = cloneDeep(fState)
            newState.options.mode = MODE_GRID
            return newState
        })
    })

    const handleAddSeries = () => {
        setFiltersState(fState => {
            const newState = cloneDeep(fState)
            newState.filters = [...newState.filters, emptySeries]
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
                {filtersState.filters.map((series, index) => (
                    <Series
                        key={index}
                        series={series}
                        index={index}
                        filters={filtersWithoutCurrentItem}
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
