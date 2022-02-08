import React, { memo, useMemo } from 'react'
import styled from 'styled-components'
import { SankeyYear } from '../types'

export const NonMemoizedYearsLegend = ({ years }: {
    years: SankeyYear[]
}) => {
    const pairs = useMemo(() => {
        const _pairs: {
            previous: SankeyYear
            next: SankeyYear
        }[] = []

        years.forEach((year, yearIndex) => {
            if (yearIndex === 0) return

            _pairs.push({
                previous: years[yearIndex - 1],
                next: year,
            })
        })

        return _pairs
    }, [years])

    return (
        <>
            {pairs.map(({previous, next}) => {
                return (
                    <g
                        key={`${previous.year}.${next.year}`}
                        transform="translate(0, -20)"
                        opacity={.4}
                    >
                        <Line
                            x1={previous.x + 26}
                            x2={next.x - 26}
                        />
                        <g transform={`translate(${next.x - 26},0)`}>
                            <PolyLine
                                points="-5,-5 0,0 -5,5"
                            />
                        </g>
                    </g>
                )
            })}
            {years.map(year => {
                return (
                    <g
                        key={year.year}
                        transform={`translate(${year.x},0)`}
                    >
                        <YearLabel
                            textAnchor="middle"
                            y={-16}
                        >
                            {year.year}
                        </YearLabel>
                    </g>
                )
            })}
        </>
    )
}

const Line = styled.line`
    stroke: ${({ theme }) => theme.colors.border}; 
`

const PolyLine = styled.polyline`
    fill: none;
    stroke: ${({ theme }) => theme.colors.border}; 
`

const YearLabel = styled.text`
    font-size: ${({ theme }) => theme.typography.size.smaller};
    fill: ${({ theme }) => theme.colors.text};
  
`

export const YearsLegend = memo(NonMemoizedYearsLegend)
