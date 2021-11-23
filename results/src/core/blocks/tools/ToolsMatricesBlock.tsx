import React, { useMemo, useState } from 'react'
import { useTheme } from 'styled-components'
import tinycolor from 'tinycolor2'
import { HeatMap } from '@nivo/heatmap'
import { keys } from 'core/bucket_keys'
import { useI18n } from 'core/i18n/i18nContext'
import Block from 'core/blocks/block/Block'
import ChartContainer from 'core/charts/ChartContainer'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'
import { BlockContext } from '../types'

export type ToolsMatrixDimension = 'years_of_experience' | 'yearly_salary' | 'company_size'

export interface ToolsMatrixRange {
    range: string
    count: number
    percentage: number
}

export interface ToolsMatrixBucket {
    id: string
    total: number
    entity: {
        name: string
    }
    ranges: ToolsMatrixRange[]
}

export interface ToolsMatrixYear {
    year: number
    buckets: ToolsMatrixBucket[]
}

export type ToolsMatricesData = Record<
    ToolsMatrixDimension,
    {
        year: ToolsMatrixYear
    }
>

interface ToolsMatricesBlockProps {
    index: number
    block: BlockContext<
        'toolsMatricesTemplate',
        'ToolsMatricesBlock',
        { toolIds: string },
        { sectionId: string }
    >
    data: ToolsMatricesData
}

const normalizeChartData = (
    toolIds: string[],
    data: ToolsMatricesData,
    dimension: ToolsMatrixDimension
) => {
    const dimensionKeys = keys[dimension].keys

    const normalizedData = data[dimension].year.buckets.map((bucket) => {
        const normalizedDatum: any = {
            tool: bucket.id,
        }
        bucket.ranges.forEach((range) => {
            normalizedDatum[range.range] = range.percentage
        })

        return normalizedDatum
    })

    return {
        dimensionKeys,
        normalizedData,
    }
}

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

const CELL_WIDTH = 80
const CELL_HEIGHT = 54
const MARGIN = {
    top: 80,
    left: 120,
}

const Switcher = ({ setDimension, dimension }) => {
    const { translate } = useI18n()

    return (
        <ButtonGroup>
            {['years_of_experience', 'yearly_salary', 'company_size'].map((key) => (
                <Button
                    key={key}
                    size="small"
                    className={`Button--${dimension === key ? 'selected' : 'unselected'}`}
                    onClick={() => setDimension(key)}
                >
                    <span className="desktop">{translate(`${key}`)}</span>
                    <span className="mobile">{translate(`${key}`)[0]}</span>
                </Button>
            ))}
        </ButtonGroup>
    )
}

const ToolsMatricesBlock = (props: ToolsMatricesBlockProps) => {
    const theme = useTheme()

    const toolIds = useMemo(() => props.block.pageVariables.toolIds.split(','), [
        props.block.pageVariables,
    ])

    const [dimension, setDimension] = useState<ToolsMatrixDimension>('years_of_experience')
    const { normalizedData, dimensionKeys } = normalizeChartData(toolIds, props.data, dimension)

    const { translate } = useI18n()
    const getRangeTick = (range: string) => {
        const key = dimensionKeys.find((k) => k.id === range)
        if (!key) {
            console.error(`no key for ${range} (${dimension})`)
            return ''
        }

        return translate(key.shortLabel)
    }

    const height = MARGIN.top + normalizedData.length * CELL_HEIGHT

    return (
        <Block
            block={props.block}
            titleProps={{
                switcher: <Switcher setDimension={setDimension} dimension={dimension} />,
            }}
            data={props.data}
        >
            <ChartContainer height={height}>
                <HeatMap
                    colors={getAlphaScale(theme.colors.heatmap, 5, 0.3)}
                    width={MARGIN.left + dimensionKeys.length * CELL_WIDTH}
                    height={height}
                    margin={MARGIN}
                    data={normalizedData}
                    keys={dimensionKeys.map((key) => key.id)}
                    indexBy="tool"
                    theme={theme.charts}
                    enableGridX
                    enableGridY
                    sizeVariation={0}
                    animate={false}
                    cellShape="rect"
                    axisTop={{
                        format: getRangeTick,
                    }}
                />
            </ChartContainer>
        </Block>
    )
}

export default ToolsMatricesBlock
