import React from 'react'
import PropTypes from 'prop-types'
import { useTheme } from 'styled-components'

const YearLabel = ({ year, x }) => {
    const theme = useTheme()

    return (
        <text fill={theme.colors.text} textAnchor="middle" x={x} fontSize={16}>
            {year}
        </text>
    )
}

YearLabel.propTypes = {
    year: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
}

const YearsLayer = ({ nodes, height }) => {
    const allYears = []
    nodes.forEach((node) => {
        if (!allYears.includes(node.year)) {
            allYears.push(node.year)
        }
    })
    allYears.sort()

    const yearLegends = allYears.map((year) => {
        const node = nodes.find((n) => n.year === year)

        return {
            year,
            x: node.x0 + (node.x1 - node.x0) / 2,
        }
    })

    return (
        <>
            <g transform="translate(0, -26)">
                {yearLegends.map((yearLegend) => (
                    <YearLabel key={yearLegend.year} year={yearLegend.year} x={yearLegend.x} />
                ))}
            </g>
            {yearLegends.map((yearLegend) => (
                <rect
                    key={yearLegend.year}
                    fill="black"
                    fillOpacity={0.3}
                    x={yearLegend.x - 18}
                    y={-9}
                    width={36}
                    height={height + 18}
                />
            ))}
            <g transform={`translate(0, ${height + 36})`}>
                {yearLegends.map((yearLegend) => (
                    <YearLabel key={yearLegend.year} year={yearLegend.year} x={yearLegend.x} />
                ))}
            </g>
        </>
    )
}

YearsLayer.propTypes = {
    height: PropTypes.number.isRequired,
    nodes: PropTypes.arrayOf(
        PropTypes.shape({
            year: PropTypes.number.isRequired,
            x0: PropTypes.number.isRequired,
            x1: PropTypes.number.isRequired,
        })
    ).isRequired,
}

export default YearsLayer
