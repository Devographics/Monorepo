import React, { useState, useRef, useEffect } from 'react'
import Series from './Series'
import styled from 'styled-components'
import T from 'core/i18n/T'
import { mq, spacing, fontSize } from 'core/theme'
import Button from 'core/components/Button'
import cloneDeep from 'lodash/cloneDeep.js'
import { useKeys, getNewSeries } from './helpers'
import { maxSeriesCount, filters } from './constants'
import { getBlockTitle } from 'core/helpers/blockHelpers'
import { usePageContext } from 'core/helpers/pageContext'
import { useI18n } from 'core/i18n/i18nContext'
import isEmpty from 'lodash/isEmpty.js'

const Filters = ({ block, series, setSeries, closeModal }) => {
    const keys = useKeys()
    const { translate } = useI18n()
    const context = usePageContext()

    const filtersWithoutCurrentItem = filters.filter(f => f !== block.id)

    const emptySeries = getNewSeries({ filters: filtersWithoutCurrentItem, keys })
    const initState = isEmpty(series) ? [emptySeries] : series
    const [filtersState, setFiltersState] = useState(initState)

    const stateStuff = {
        filtersState,
        setFiltersState
    }

    const handleAddSeries = () => {
        setFiltersState(fState => {
            const newState = cloneDeep(fState)
            return [...newState, emptySeries]
        })
    }

    const handleSubmit = () => {
        setSeries(filtersState)
        closeModal()
    }

    const canAddSeries = filtersState.length < maxSeriesCount

    const chartName = getBlockTitle(block, context, translate)

    return (
        <Filters_>
            <FiltersTop_>
                <Heading_>
                    <T k="filters.customize_chart" values={{ chartName }} />
                </Heading_>
            </FiltersTop_>
            <Series_>
                {filtersState.map((series, index) => (
                    <Series
                        key={index}
                        series={series}
                        index={index}
                        filters={filtersWithoutCurrentItem}
                        stateStuff={stateStuff}
                    />
                ))}
            </Series_>
            {canAddSeries && (
                <EmptySeries_>
                    <Button onClick={handleAddSeries}>
                        <T k="filters.series.add" />
                    </Button>
                </EmptySeries_>
            )}

            <Button onClick={handleSubmit}>
                <T k="filters.submit" />
            </Button>
        </Filters_>
    )
}

const Filters_ = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing()};
`

const Heading_ = styled.h3``

const FiltersTop_ = styled.div``


const Series_ = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing()};
`

const EmptySeries_ = styled.div`
    display: grid;
    place-items: center;
    border: 1px dashed ${({ theme }) => theme.colors.border};
    border-radius: 3px;
    padding: ${spacing()};
`

export default Filters
