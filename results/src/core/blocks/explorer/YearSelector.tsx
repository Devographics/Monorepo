import React from 'react'
import styled from 'styled-components'
// import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
import { ExplorerDataFacet } from './types'

const YearSelector = ({ allYears, stateStuff }: { allYears: number[]; stateStuff: any }) => {
    const { currentYear, setCurrentYear } = stateStuff
    return (
        <YearSelector_>
            {allYears.map(year => (
                <Year_
                    key={year}
                    isCurrentYear={year === currentYear}
                    onClick={() => {
                        setCurrentYear(year)
                    }}
                >
                    {year}
                </Year_>
            ))}
        </YearSelector_>
    )
}

const YearSelector_ = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
`

const Year_ = styled.button<{ isCurrentYear: boolean }>`
    border: ${({ isCurrentYear }) => (isCurrentYear ? '3px solid white' : 'none')};
`

export default YearSelector
