import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { usePageContext } from 'core/helpers/pageContext'
import cloneDeep from 'lodash/cloneDeep.js'
import { PanelState } from './types'

type YearSelectorProps = {
    seriesIndex: number
    stateStuff: PanelState
}

const YearSelector = ({ seriesIndex, stateStuff }: YearSelectorProps) => {
    const { filtersState, setFiltersState } = stateStuff

    const context = usePageContext()
    const { currentSurvey, currentEdition } = context
    const { editions } = currentSurvey
    const years = editions.map(e => e.year)

    return (
        <Label_>
            {/* <span>{segmentId}</span> */}
            <Select_
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value
                    setFiltersState(fState => {
                        const newState = cloneDeep(fState)
                        newState.filters[seriesIndex].year = Number(value)
                        return newState
                    })
                }}
                value={filtersState.filters[seriesIndex].year || currentEdition.year}
            >
                {years.map(year => (
                    <option key={year} value={year}>
                        {year}
                    </option>
                ))}
            </Select_>
        </Label_>
    )
}

const Label_ = styled.label``
const Select_ = styled.select``

export default YearSelector
