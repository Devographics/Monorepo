import React, { useState, useRef, useEffect } from 'react'
import Condition from './Condition'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { filters } from './constants'
import difference from 'lodash/difference.js'
import cloneDeep from 'lodash/cloneDeep.js'
import { useKeys, getNewCondition } from './helpers'


const Series = ({ series, block, index, stateStuff }) => {
    const { conditions } = series
    const { setFiltersState } = stateStuff

    const keys = useKeys()

    const filtersWithoutCurrentItem = filters.filter(f => f !== block.id)
    const filtersInUse = conditions.map(c => c.field)
    const filtersNotInUse = difference(filtersWithoutCurrentItem, filtersInUse)

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
        <Series_>
            <SeriesTop_>
                <SeriesHeading_>
                    <T k="filters.series.heading" values={{ index: index + 1 }} />
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
                        filtersWithoutCurrentItem={filtersWithoutCurrentItem}
                        filtersInUse={filtersInUse}
                        filtersNotInUse={filtersNotInUse}
                        stateStuff={stateStuff}
                        block={block}
                    />
                ))}
            </Conditions_>

            <SeriesBottom_>
                {canAddConditions && <Button onClick={handleAddCondition}>
                    <T k="filters.condition.add" />
                </Button>}
            </SeriesBottom_>
        </Series_>
    )
}

const Series_ = styled.div`
    border: 1px dashed ${({ theme }) => theme.colors.border};
    border-radius: 3px;
    padding: ${spacing()};
    display: flex;
    flex-direction: column;
    gap: ${spacing()};
`

const SeriesTop_ = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`

const SeriesBottom_ = styled.div`
    display: flex;
    justify-content: flex-end;
`

const SeriesHeading_ = styled.h3``

const Conditions_ = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing(0.5)};
`

export default Series
