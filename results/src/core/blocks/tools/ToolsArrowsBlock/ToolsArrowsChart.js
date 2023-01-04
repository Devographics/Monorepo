import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { scaleLinear } from 'd3-scale'
import map from 'lodash/map'
import flatten from 'lodash/flatten'
import { extent, max, sum } from 'd3-array'
import variables from 'Config/variables.yml'
import offsets from './toolsArrowsLabelOffsets.js'
import { useI18n } from 'core/i18n/i18nContext'
import './ToolsArrowsChart.scss'
import get from 'lodash/get'
import styled, { ThemeContext, useTheme } from 'styled-components'
import labelOffsets from './toolsArrowsLabelOffsets.js'
import { getVelocity, getVelocityColor, getVelocityColorScale } from './helpers.js'
import { Delaunay } from 'd3-delaunay'

const { toolsCategories } = variables

// hide any item with less than n years of data
const minimumYearCount = 2

const gradientLineWidthScale = scaleLinear().domain([1, 0]).range([7, 3]).clamp(true)

export const ToolsArrowsChart = ({ data, activeCategory }) => {
    const theme = useTheme()

    const getColor = (id) => theme.colors.ranges.toolSections[id]

    let toolToCategoryMap = {}
    map(toolsCategories, (tools, category) => {
        tools.forEach((tool) => {
            toolToCategoryMap[tool] = category
        })
    })

    let categoryColorMap = {}
    let categoryColorScales = {}
    map(toolsCategories, (tools, category) => {
        const color = getColor(category)
        categoryColorMap[category] = color
        categoryColorScales[category] = scaleLinear()
            .domain([0, 30])
            .range([color, '#303652'])
            .clamp(true)
    })

    const { translate } = useI18n()

    const [hoveredTool, setHoveredTool] = useState(null)
    const windowWidth = useWindowWidth()
    const windowHeight = useWindowHeight()
    const canvasElement = useRef()

    const dms = useMemo(() => {
        const width = windowWidth > 900 ? windowWidth - 480 : 800

        // const width = windowHeight > 1000 ? 1200 : windowHeight > 800 ? 1000 : 950

        const height = windowHeight > 1000 ? 850 : windowHeight > 800 ? 750 : 650

        return {
            width,
            height,
        }
    }, [windowWidth, windowHeight])

    var isFirefox =
        typeof navigator !== 'undefined' &&
        navigator.userAgent.toLowerCase().indexOf('firefox') > -1

    const tools = data.map((d) => d.id)
    let toolNames = {}
    data.forEach((tool) => {
        toolNames[tool.id] = tool?.entity?.name
    })

    const items = useMemo(
        () =>
            data.map((tool) => {
                const allYears = get(tool, 'experience.all_years', [])
                console.log(tool)
                console.log(allYears)
                return allYears?.map(({ year, facets }) => {
                    const points = facets[0].buckets.map(({ id, percentage_question }) =>
                        conditionDiffs[id].map((d) => d * percentage_question)
                    )
                    return [sum(points.map((d) => d[0])), sum(points.map((d) => d[1])), year]
                })}
            ),
        [data]
    )

    const scales = useMemo(() => {
        const xExtent = extent(flatten(items).map((d) => d[0]))
        const maxAbsX = max(xExtent.map(Math.abs))
        const xScale = scaleLinear()
            .domain([-maxAbsX, maxAbsX])
            .range([20, dms.width - 20])

        const yExtent = extent(flatten(items).map((d) => d[1]))
        const maxAbsY = max(yExtent.map(Math.abs))
        const yScale = scaleLinear()
            .domain([-maxAbsY, maxAbsY])
            .range([dms.height - 30, 30])

        return {
            x: xScale,
            y: yScale,
        }
    }, [items, dms])

    const labels = useMemo(() => {
        return items
            .map(
                (points, i) => {
                    const tool = tools[i]
                    const toolName = toolNames[tool]
                    const category = toolToCategoryMap[tool]
                    if (!points.length || points.length < minimumYearCount) return null

                    const thisYearPoint = points.slice(-1)[0]

                    const x = scales.x(thisYearPoint[0]) + ((offsets[tools[i]] || {}).x || 0)
                    const y = scales.y(thisYearPoint[1]) + ((offsets[tools[i]] || {}).y || 0)

                    const velocity = getVelocity(points)
                    const color = getVelocityColor(velocity, theme)

                    return {
                        tool,
                        toolName,
                        category,
                        x,
                        y,
                        color,
                        points,
                        velocity,
                    }
                },
                [items]
            )
            .filter((d) => d)
    }, [dms, items])

    const delaunay = useMemo(
        () =>
            Delaunay.from(
                labels || [],
                ({ x }) => x,
                ({ y }) => y
            )
    )


    const draw = () => {
        if (!canvasElement.current) return
        const ctx = canvasElement.current.getContext('2d')

        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1

        ctx.clearRect(0, 0, dms.width, dms.height)

        const drawLine = (p1, p2) => {
            ctx.beginPath()
            ctx.moveTo(p1[0], p1[1])
            ctx.lineTo(p2[0], p2[1])
            ctx.stroke()
        }

        ctx.globalCompositeOperation = 'lighten'
        ctx.lineCap = 'round'

        // draw lines
        items.forEach((points, i) => {
            const tool = tools[i]
            const toolName = toolNames[tool]
            const category = toolToCategoryMap[tool]
            if (!points.length) return null
            if (activeCategory !== 'all' && activeCategory !== category) return null

            const thisYearPoint = points.slice(-1)[0]

            points.forEach(([x, y], i) => {
                const nextPoint = points[i + 1]
                if (!nextPoint) return

                let alpha = !hoveredTool ? 1 : hoveredTool.tool === tool ? 1 : 0.2
                ctx.globalAlpha = alpha

                const r = gradientLineWidthScale(i / points.length)

                const velocity = getVelocity(points)
                const color = getVelocityColor(velocity, theme)
                const colorScale = getVelocityColorScale(velocity, theme)

                // const colorStart = colorScale(i / points.length)
                const colorStart = colorScale(i / points.length)
                const colorEnd = colorScale((i + 1) / points.length)
                const start = [scales.x(x), scales.y(y)]
                const end = [scales.x(nextPoint[0]), scales.y(nextPoint[1])]

                var gradient = ctx.createLinearGradient(...start, ...end)
                gradient.addColorStop(0, colorStart)
                gradient.addColorStop(1, colorEnd)
                ctx.strokeStyle = gradient
                // ctx.strokeStyle = 'green'
                ctx.lineWidth = r * 2

                drawLine(start, end)
            })
        })
    }
    useEffect(draw, [hoveredTool, labels, dms])

    const onMouseMove = (e) => {
        if (!canvasElement.current) {
            setHoveredTool(null)
            return
        }
        const bounds = canvasElement.current.getBoundingClientRect()
        const x = e.clientX - bounds.left
        const y = e.clientY - bounds.top
        const labelIndex = delaunay.find(x, y)
        const label = labels[labelIndex]
        if (!label) {
            setHoveredTool(null)
            return
        }
        const diff = Math.sqrt((label.x - x) ** 2 + (label.y - y) ** 2)
        if (diff > 50) {
            setHoveredTool(null)
            return
        }
        setHoveredTool(label)
    }

    return (
        <>
            <div className="ToolsArrowsChart">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    className="ToolsArrowsChart__svg"
                    height={dms.height}
                    width={dms.width}
                >
                    <line
                        className="ToolsArrowsChart__axis"
                        x2={dms.width}
                        y1={dms.height / 2}
                        y2={dms.height / 2}
                    />
                    <line
                        className="ToolsArrowsChart__axis"
                        x1={dms.width / 2}
                        x2={dms.width / 2}
                        y2={dms.height}
                    />
                    <text
                      className="hide_visually"
                      x={-9999999}
                      y={-9999999}>
                       {translate('charts.tools_arrows.x_axis')}
                    </text>
                    <text className="ToolsArrowsChart__axis__label" y={dms.height / 2 - 10}>
                        {translate('charts.tools_arrows.negative_opinion')}
                    </text>
                    <text
                        className="ToolsArrowsChart__axis__label"
                        x={dms.width}
                        y={dms.height / 2 - 10}
                        style={{
                            textAnchor: 'end',
                        }}
                    >
                        {translate('charts.tools_arrows.positive_opinion')}
                    </text>
                    <text
                      className="hide_visually"
                      x={-9999999}
                      y={-9999999}>
                        {translate('charts.tools_arrows.y_axis')}
                    </text>
                    <text
                        className="ToolsArrowsChart__axis__label"
                        x={dms.width / 2}
                        y={10}
                        style={{
                            textAnchor: 'middle',
                        }}
                    >
                        {translate('charts.tools_arrows.have_used')}
                    </text>
                    <text
                        className="ToolsArrowsChart__axis__label"
                        x={dms.width / 2}
                        y={dms.height - 10}
                        style={{
                            textAnchor: 'middle',
                        }}
                    >
                        {translate('charts.tools_arrows.have_not_used')}
                    </text>
                </svg>

                <canvas
                    className="ToolsArrowsChart__canvas"
                    height={dms.height}
                    width={dms.width}
                    ref={canvasElement}
                />

                <svg className="ToolsArrowsChart__svg" height={dms.height} width={dms.width}>
                    {labels.map(({ tool, toolName, category, x, y, color, points, velocity }, i) => {
                        return (
                            <g
                                key={i}
                                className={`ToolsArrowsChart__tool ToolsArrowsChart__tool--is-${
                                    activeCategory !== 'all' && activeCategory !== category
                                        ? 'hidden'
                                        : activeCategory === category
                                        ? 'active'
                                        : !hoveredTool
                                        ? 'normal'
                                        : hoveredTool.tool === tool
                                        ? 'hovering'
                                        : 'hovering-other'
                                }`}
                            >
                                <text
                                  className="ToolsArrowsChart__label-background" // border around text
                                  x={x} 
                                  y={y}
                                  aria-hidden="true" // Avoid being read twice by screen readers
                                >
                                    {toolName}
                                </text>
                                <text
                                    className="ToolsArrowsChart__label"
                                    fill={color}
                                    x={x}
                                    y={y}
                                    aria-hidden="true" // Avoid being read twice by screen readers
                                >
                                    {toolName}
                                </text>
                                <text
                                    className="hide_visually"
                                    x={-9999999}
                                    y={-9999999}>
                                    {toolName}. {
                                        translate('charts.tools_arrows.velocity')}: {
                                            parseInt(velocity * 100) / 100
                                        }. {velocity < 0 
                                            ? translate('charts.tools_arrows.velocity_positive') 
                                            : translate('charts.tools_arrows.velocity_negative')
                                    }.
                                </text>

                                {points.map(([x, y, year], i) => {
                                    const isFirstLabelToTheRight =
                                        scales.x(x) > dms.width * 0.9 ||
                                        labelsToTheRight.indexOf(tool) !== -1

                                    const showLabel = true //hoveredTool && hoveredTool.tool === tool

                                    return (
                                        <Fragment key={i}>
                                            {showLabel && (
                                                <g>
                                                  <text
                                                    className="ToolsArrowsChart__year"
                                                    x={
                                                        scales.x(x) +
                                                        10 * (isFirstLabelToTheRight ? -1 : 1)
                                                    }
                                                    y={scales.y(y) + 5}
                                                    style={{
                                                        textAnchor: isFirstLabelToTheRight
                                                            ? 'end'
                                                            : 'start',
                                                    }}
                                                    aria-hidden="true"
                                                  >
                                                      {year}
                                                  </text>
                                                  <text 
                                                      x={-99999999}
                                                      y={-99999999}
                                                      className="hide_visually">
                                                      {tool}, {year}: 
                                                      {x < 0 
                                                          ? translate('charts.tools_arrows.opinions_negative') 
                                                          : translate('charts.tools_arrows.opinions_positive')
                                                      } ({parseInt(x * 100) / 100}%), 
                                                      {y < 0 
                                                          ? translate('charts.tools_arrows.usage_low') 
                                                          : translate('charts.tools_arrows.usage_high')
                                                      } ({parseInt(y * 100) / 100}%)
                                                  </text>
                                                </g>
                                            )}
                                            
                                            {showLabel && <circle
                                                className="ToolsArrowsChart__year"
                                                cx={scales.x(x)}
                                                cy={scales.y(y)}
                                                r="4"
                                                fill="white"
                                            />}
                                        </Fragment>
                                    )
                                })}
                            </g>
                        )
                    })}
                    <rect
                        className="ToolsArrowsChart__listener"
                        width={dms.width}
                        height={dms.height}
                        onMouseMove={onMouseMove}
                    />
                </svg>
            </div>
            <div className="legend">
                <p className="hide_visually">
                    {translate('charts.tools_arrows.legend')}
                </p>
                <p 
                    className="legend_label right" 
                    style={{
                        borderColor: getVelocityColor(100, theme), 
                        color: theme.colors.highVelocity,
                        fontWeight: 'bold'
                    }}
                >
                    {translate('charts.tools_arrows.popularity_positive')}
                </p>
                <div 
                  className="legend_colors"
                  style={{
                      backgroundImage: `linear-gradient(90deg, ${getVelocityColor(-100, theme)}, ${getVelocityColor(0, theme)}, ${getVelocityColor(100, theme)})`,
                      borderLeftColor: getVelocityColor(-80, theme),
                      borderRightColor: getVelocityColor(90, theme)
                  }}
                ></div>
                <p 
                    className="legend_label left" 
                    style={{
                        borderColor: getVelocityColor(-80, theme), 
                        color: theme.colors.lowVelocity,
                        fontWeight: 'bold'
                    }}
                >
                    {translate('charts.tools_arrows.popularity_negative')}
                </p>
            </div>
        </>
    )
}

ToolsArrowsChart.propTypes = {
    // ...
}

export default ToolsArrowsChart

// each response has an associated value for the [x, y] axes
const conditionDiffs = {
    never_heard: [0, -1],
    not_interested: [-1, -1],
    interested: [1, -1],
    would_not_use: [-1, 1],
    would_use: [1, 1],
}

function useWindowWidth() {
    const [windowWidth, setWindowWidth] = useState(
        (typeof window !== 'undefined' && window.innerWidth) || 1000
    )

    function handleResize() {
        setWindowWidth((typeof window !== 'undefined' && window.innerWidth) || 1000)
    }

    useEffect(() => {
        if (typeof window === 'undefined') return
        window.addEventListener('resize', handleResize)
        handleResize()

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return windowWidth
}

function useWindowHeight() {
    const [windowHeight, setWindowHeight] = useState(
        (typeof window !== 'undefined' && window.innerHeight) || 1000
    )

    function handleResize() {
        setWindowHeight((typeof window !== 'undefined' && window.innerHeight) || 1000)
    }

    useEffect(() => {
        if (typeof window === 'undefined') return
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return windowHeight
}

const labelsToTheRight = [
    'mobx',
    'relay',
    'nuxt',
    'svelte',
    'ava',
    'electron',
    'nextjs',
    'vuejs',
    'cypress',
]