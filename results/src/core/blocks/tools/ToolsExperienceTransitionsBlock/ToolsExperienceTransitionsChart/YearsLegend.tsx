import React, { Fragment, memo, useMemo } from 'react'
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
                    <Fragment key={`${previous.year}.${next.year}`}>
                        <g transform="translate(0, -20)" opacity={.4}>
                            <line
                                x1={previous.x + 26}
                                x2={next.x - 26}
                                fill="none"
                                stroke="rgb(224, 228, 228)"
                            />
                            <g transform={`translate(${next.x - 26},0)`}>
                                <polyline
                                    points="-5,-5 0,0 -5,5"
                                    fill="none"
                                    stroke="rgb(224, 228, 228)"
                                />
                            </g>
                        </g>
                        <g transform={`translate(0, ${320 + 22})`} opacity={.4}>
                            <line
                                x1={previous.x + 26}
                                x2={next.x - 26}
                                fill="none"
                                stroke="rgb(224, 228, 228)"
                            />
                            <g transform={`translate(${next.x - 26},0)`}>
                                <polyline
                                    points="-5,-5 0,0 -5,5"
                                    fill="none"
                                    stroke="rgb(224, 228, 228)"
                                />
                            </g>
                        </g>
                    </Fragment>
                )
            })}
            {years.map(year => {
                return (
                    <g
                        key={year.year}
                        transform={`translate(${year.x},0)`}
                    >
                        <text
                            textAnchor="middle"
                            style={{
                                fontSize: 12,
                                fontWeight: 600,
                                fill: 'rgb(224, 228, 228)',
                            }}
                            y={-16}
                        >
                            {year.year}
                        </text>
                        <text
                            textAnchor="middle"
                            dominantBaseline="hanging"
                            style={{
                                fontSize: 12,
                                fontWeight: 600,
                                fill: 'rgb(224, 228, 228)',
                            }}
                            y={320 + 16}
                        >
                            {year.year}
                        </text>
                    </g>
                )
            })}
        </>
    )
}

export const YearsLegend = memo(NonMemoizedYearsLegend)
