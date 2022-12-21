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

const sampleFilters = [
    {
        conditions: [
            {
                field: 'gender',
                operator: 'eq',
                value: 'female'
            }
            // {
            //     field: 'country',
            //     operator: 'eq',
            //     value: 'FRA'
            // },
        ]
    }
    // {
    //     conditions: [
    //         {
    //             field: 'gender',
    //             operator: 'eq',
    //             value: 'non_binary'
    //         },
    //         // {
    //         //     field: 'country',
    //         //     operator: 'eq',
    //         //     value: 'FRA'
    //         // }
    //     ]
    // }
]

const Filters = ({ block, setSeries, closeModal }) => {
    const keys = useKeys()
    const { translate } = useI18n()
    const context = usePageContext()

    const emptySeries = getNewSeries({ filters, keys })
    const [filtersState, setFiltersState] = useState([emptySeries])

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
                    <Series block={block} key={index} series={series} index={index} stateStuff={stateStuff} />
                ))}
            </Series_>
            <FiltersBottom_>
                {canAddSeries && (
                    <Button onClick={handleAddSeries}>
                        <T k="filters.series.add" />
                    </Button>
                )}
            </FiltersBottom_>

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

const FiltersBottom_ = styled.div`
    display: flex;
    justify-content: flex-end;
`

const Series_ = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing()};
`

export default Filters
