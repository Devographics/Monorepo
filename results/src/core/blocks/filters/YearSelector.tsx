import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { usePageContext } from 'core/helpers/pageContext'
import cloneDeep from 'lodash/cloneDeep.js'

const YearSelector = ({ seriesIndex, stateStuff }) => {
    const { filtersState, setFiltersState } = stateStuff

    const context = usePageContext()
    const { currentSurvey } = context
    const { editions } = currentSurvey
    const years = editions.map(e => e.year)

    return (
        <Label_>
            {/* <span>{segmentId}</span> */}
            <Select_
                onChange={e => {
                    const value = e.target.value
                    setFiltersState(fState => {
                      const newState = cloneDeep(fState)
                      newState[seriesIndex].year = Number(value)
                      return newState
                    })
                }}
                value={filtersState[seriesIndex].year}
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
