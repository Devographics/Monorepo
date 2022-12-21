import React, { useState, useRef, useEffect } from 'react'
import Condition from './Condition'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import difference from 'lodash/difference.js'
import cloneDeep from 'lodash/cloneDeep.js'
import { useKeys, getNewCondition } from './helpers'
import { Condition_ } from './Condition'

const Series = ({ filters, series, index, stateStuff }) => {
    const { conditions } = series
    const { setFiltersState } = stateStuff

    const keys = useKeys()

    const filtersInUse = conditions.map(c => c.field)
    const filtersNotInUse = difference(filters, filtersInUse)

    const handleAddCondition = () => {
        setFiltersState(fState => {
            const newState = cloneDeep(fState)
            newState[index].conditions = [
                ...series.conditions,
                getNewCondition({ filtersNotInUse, keys })
            ]
            return newState
        })
    }

    const handleDeleteSeries = () => {
        setFiltersState(fState => {
            const newState = cloneDeep(fState)
            newState.splice(index, 1)
            return newState
        })
    }

    const canAddConditions = conditions.length < filters.length

    return (
        <ActiveSeries_>
            <SeriesTop_>
                <SeriesHeading_>
                    <T k="filters.series.heading" values={{ index: index + 2 }} />
                </SeriesHeading_>
                <Button size="small" onClick={handleDeleteSeries}>
                    <T k="filters.series.delete" />
                </Button>
            </SeriesTop_>
            <Conditions_>
                {conditions.map((condition, i) => (
                    <Condition
                        key={i}
                        seriesIndex={index}
                        index={i}
                        condition={condition}
                        filters={filters}
                        filtersInUse={filtersInUse}
                        filtersNotInUse={filtersNotInUse}
                        stateStuff={stateStuff}
                    />
                ))}
                {canAddConditions && (
                    <EmptyCondition_>
                        <Button size="small" onClick={handleAddCondition}>
                            <T k="filters.condition.add" />
                        </Button>
                    </EmptyCondition_>
                )}
            </Conditions_>
        </ActiveSeries_>
    )
}

export const Series_ = styled.div`
    border: 1px dashed ${({ theme }) => theme.colors.border};
    border-radius: 3px;
    padding: ${spacing()};
`

const ActiveSeries_ = styled(Series_)`
    display: flex;
    flex-direction: column;
    gap: ${spacing()};
`

const SeriesTop_ = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`

const EmptyCondition_ = styled(Condition_)`
    display: grid;
    place-items: center;
`

const SeriesHeading_ = styled.h3``

const Conditions_ = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing(0.5)};
`

export default Series
