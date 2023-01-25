import React, { useState, useRef, useEffect } from 'react'
import Condition from './Condition'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import difference from 'lodash/difference.js'
import cloneDeep from 'lodash/cloneDeep.js'
import { getNewCondition } from './helpers'
import { Condition_ } from './Condition'
import { TrashIcon, DeleteIcon } from 'core/icons'
import { useTheme } from 'styled-components'
import YearSelector from './YearSelector'
import { useAllChartsOptionsIdsOnly } from 'core/charts/hooks'

const Series = ({ filters, series, index, stateStuff }) => {
    const theme = useTheme()

    const { conditions } = series
    const { filtersState, setFiltersState } = stateStuff
    const showDefaultSeries = filtersState.options.showDefaultSeries

    const allChartsKeys = useAllChartsOptionsIdsOnly()

    const filtersInUse = conditions.map(c => c.field)
    const filtersNotInUse = difference(filters, filtersInUse)

    const handleAddCondition = () => {
        setFiltersState(fState => {
            const newState = cloneDeep(fState)
            newState.filters[index].conditions = [
                ...series.conditions,
                getNewCondition({ filtersNotInUse, keys: allChartsKeys })
            ]
            return newState
        })
    }

    const handleDeleteSeries = () => {
        setFiltersState(fState => {
            const newState = cloneDeep(fState)
            newState.filters.splice(index, 1)
            return newState
        })
    }

    const canAddConditions = conditions.length < filters.length

    const backgroundColor = theme.colors.barColors[index].color

    return (
        <ActiveSeries_>
            <SeriesTop_>
                <SeriesHeading_>
                    <SeriesChip_ style={{ backgroundColor }} />
                    <T k="filters.series.heading" values={{ index: index + 1 }} />
                    <YearSelector seriesIndex={index} stateStuff={stateStuff} />
                </SeriesHeading_>
                <DeleteSeries_ size="small" onClick={handleDeleteSeries}>
                        <DeleteIcon labelId="filters.series.delete" />
                    {/* <Button size="small" onClick={handleDeleteSeries}>
                    <T k="filters.series.delete" />
                </Button> */}
                </DeleteSeries_>
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
    border: 1px solid ${({ theme }) => theme.colors.borderAlt};
    border-radius: 3px;
    padding: ${spacing()};
    position: relative;
    background: ${({ theme }) => theme.colors.backgroundAlt};
`

const ActiveSeries_ = styled(Series_)`
    display: flex;
    flex-direction: column;
    gap: ${spacing()};
`

const DeleteSeries_ = styled(Button)`
    position: absolute;
    top: 20px;
    right: 0px;
    transform: translateX(50%);
    aspect-ratio: 1/1;
    border-radius: 100%;
    background: ${({ theme }) => theme.colors.backgroundAlt};
    border: 1px solid ${({ theme }) => theme.colors.borderAlt};
    display: grid;
    place-items: center;
`

const SeriesChip_ = styled.div`
    height: 16px;
    width: 16px;
`

const SeriesTop_ = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`

const EmptyCondition_ = styled(Condition_)`
    display: grid;
    place-items: center;
    padding: ${spacing()};
`

const SeriesHeading_ = styled.h3`
    display: flex;
    align-items: center;
    gap: ${spacing(0.5)};
`

const Conditions_ = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing(0.5)};
`

export default Series
