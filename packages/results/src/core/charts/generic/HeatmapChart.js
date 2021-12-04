import React, { memo, useState, useMemo } from 'react'
import styled, { useTheme } from 'styled-components'
import PropTypes from 'prop-types'
import { scaleLinear } from 'd3-scale'
import { useI18n } from 'core/i18n/i18nContext'
import HeatmapChartRow from 'core/charts/generic/HeatmapChartRow'
import tinycolor from 'tinycolor2'
import { spacing, fontSize } from 'core/theme'

// accepts either a number of steps and an offset for regular steps,
// or a specified array of alpha steps
const getAlphaScale = (color, alphaSteps, startOffset) => {
    const a = Array.isArray(alphaSteps) ? alphaSteps : Array.from({ length: alphaSteps })
    return a.map((step, i) => {
        const c = tinycolor(color)
        c.setAlpha(step ? step : startOffset + ((1 - startOffset) * i) / alphaSteps)
        const cs = c.toRgbString()
        return cs
    })
}

const HeatmapChart = ({ bucketKeys, data, i18nNamespace }) => {
    const { translate } = useI18n()
    const theme = useTheme()
    const [currentIndex, setCurrentIndex] = useState(null)

    const backgroundColorScale = useMemo(
        () =>
            scaleLinear()
                .domain([0, 10, 20, 30, 40])
                .range(getAlphaScale(theme.colors.heatmap, 5, 0.3)),
        [theme]
    )

    return (
        <Container
            style={{
                gridTemplateColumns: `auto ${'70px '.repeat(bucketKeys.length)}`,
            }}
        >
            <Legend>{translate(`charts.axis_legends.${i18nNamespace}`)}</Legend>
            {bucketKeys.map((key) => (
                <Header key={key.id}>{key.shortLabel}</Header>
            ))}
            {data.map((bucket, i) => (
                <HeatmapChartRow
                    key={bucket.id}
                    item={bucket}
                    keys={bucketKeys.map((key) => key.id)}
                    index={i}
                    backgroundColorScale={backgroundColorScale}
                    setCurrent={setCurrentIndex}
                    isActive={currentIndex === i}
                    isInactive={currentIndex !== null && currentIndex !== i}
                    isEven={i % 2 === 0}
                />
            ))}
            <ColorLegendLabel />
            <ColorLegend
                style={{
                    gridColumnEnd: bucketKeys.length + 1,
                }}
            >
                <ColorLegendCell
                    style={{
                        borderColor: backgroundColorScale(0),
                    }}
                >
                    0
                </ColorLegendCell>
                <ColorLegendCell
                    style={{
                        borderColor: backgroundColorScale(10),
                    }}
                >
                    10%
                </ColorLegendCell>
                <ColorLegendCell
                    style={{
                        borderColor: backgroundColorScale(20),
                    }}
                >
                    20%
                </ColorLegendCell>
                <ColorLegendCell
                    style={{
                        borderColor: backgroundColorScale(20),
                    }}
                >
                    30%
                </ColorLegendCell>
                <ColorLegendCell
                    style={{
                        borderColor: backgroundColorScale(40),
                    }}
                >
                    40%
                </ColorLegendCell>
            </ColorLegend>
        </Container>
    )
}

HeatmapChart.propTypes = {
    bucketKeys: PropTypes.arrayOf(PropTypes.object).isRequired,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            ranges: PropTypes.arrayOf(
                PropTypes.shape({
                    range: PropTypes.string.isRequired,
                    count: PropTypes.number.isRequired,
                    percentage: PropTypes.number.isRequired,
                })
            ).isRequired,
        })
    ).isRequired,
    i18nNamespace: PropTypes.string.isRequired,
}

const Container = styled.div`
    display: grid;
    white-space: nowrap;
`

const Legend = styled.div`
    font-size: ${fontSize('smallish')};
    font-weight: 600;
    padding: ${spacing(0.5)} 0;
    align-self: end;
`

const Header = styled.div`
    font-size: ${fontSize('small')};
    font-weight: 600;
    padding: ${spacing(0.5)} 0;
    text-align: center;
    overflow: hidden;
`

const ColorLegendLabel = styled.div`
    margin-top: ${spacing(1.5)};
    text-align: right;
    grid-column-start: 1;
    grid-column-end: 3;
    font-size: ${fontSize('smallish')};
    padding-right: ${spacing()};
    align-self: start;
`

const ColorLegend = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    align-items: start;
    grid-column-start: 3;
    margin-top: ${spacing(1.5)};
`

const ColorLegendCell = styled.span`
    font-size: ${fontSize('small')};
    text-align: center;
    border-bottom: 6px solid;
    padding: 2px 0 8px;
`

export default memo(HeatmapChart)
