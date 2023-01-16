import React, { useState, useRef, useEffect } from 'react'
import Series from './Series'
import styled from 'styled-components'
import T from 'core/i18n/T'
import { mq, spacing, fontSize } from 'core/theme'
import Button from 'core/components/Button'
import cloneDeep from 'lodash/cloneDeep.js'
import { useKeys, getNewSeries, getFiltersQuery } from './helpers'
import { maxSeriesCount, filters } from './constants'
import { getBlockTitle } from 'core/helpers/blockHelpers'
import { usePageContext } from 'core/helpers/pageContext'
import { useI18n } from 'core/i18n/i18nContext'
import isEmpty from 'lodash/isEmpty.js'
import { Series_ } from './Series'
import { ExportButton, GraphQLExport, GraphQLTrigger } from 'core/blocks/block/BlockData'
import ModalTrigger from 'core/components/ModalTrigger'

const Filters = ({ block, chartFilters, setChartFilters, closeModal }) => {
    const keys = useKeys()
    const { translate } = useI18n()
    const context = usePageContext()
    const { currentEdition } = context

    const filtersWithoutCurrentItem = filters.filter(f => f !== block.id)

    const emptySeries = getNewSeries({
        filters: filtersWithoutCurrentItem,
        keys,
        year: currentEdition.year
    })
    const initState = isEmpty(chartFilters) ? [] : chartFilters
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
        setChartFilters(filtersState)
        closeModal()
    }

    const canAddSeries = filtersState.length < maxSeriesCount

    const chartName = getBlockTitle(block, context, translate)

    return (
        <Filters_>
            <FiltersTop_>
                <Heading_>
                    <T k="filters.compare_chart" values={{ chartName }} />
                </Heading_>
                <Description_>
                    <T k="filters.description" html={true} md={true} />
                </Description_>
            </FiltersTop_>
            <SeriesList_>
                {filtersState.map((series, index) => (
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

            <FiltersBottom_>
                <GraphQLTrigger
                    block={block}
                    query={getFiltersQuery({
                        block,
                        chartFilters: filtersState,
                        currentYear: currentEdition.year
                    })}
                    buttonProps={{variant: 'link'}}
                />
                <Button onClick={handleSubmit}>
                    <T k="filters.submit" />
                </Button>
            </FiltersBottom_>
        </Filters_>
    )
}

const Filters_ = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing()};
`

const Heading_ = styled.h3``

const Description_ = styled.div``

const FiltersTop_ = styled.div``

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

const FiltersBottom_ = styled.div`
    display: flex;
    justify-content: space-between;
`

const ExportButton_ = styled(Button)`
    display: inline;
    margin: 0;
`

export default Filters
