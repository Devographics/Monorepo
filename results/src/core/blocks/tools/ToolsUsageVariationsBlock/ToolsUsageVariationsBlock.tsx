import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { BlockContext } from 'core/blocks/types'
// @ts-ignore
import Block from 'core/blocks/block/Block'
import { UsageVariationsChart } from 'core/charts/generic/UsageVariationsChart'
import { keys } from 'core/bucket_keys'
import { ToolsExperienceMatrices } from 'core/survey_api/matrices'
import { DimensionId } from './types'
import { Switcher } from './Switcher'

interface ToolsUsageVariationsBlockProps {
    block: BlockContext<
        'toolsRangesDeltaJoyPlotTemplate',
        'ToolsRangesDeltaJoyPlotBlock',
        { toolIds: string },
        any
    >
    data: ToolsExperienceMatrices
}

const keysByDimension: Record<DimensionId, string[]> = {
    years_of_experience: keys.years_of_experience.keys.map((key) => key.id),
    yearly_salary: keys.yearly_salary.keys.map((key) => key.id),
    company_size: keys.company_size.keys.map((key) => key.id),
}

const MAX_WIDTH = 900
const CHART_MARGIN = {
    top: 170,
    right: 60,
    bottom: 50,
    left: 140,
}

export const ToolsUsageVariationsBlock = ({ data, block }: ToolsUsageVariationsBlockProps) => {
    const [dimension, setDimension] = useState<DimensionId>('years_of_experience')

    const keys = keysByDimension[dimension]
    const dimensionData = data.dimensions.find((d) => d.dimension === dimension)

    const normalizedData = useMemo(
        () =>
            dimensionData!.tools.map((datum) => {
                return {
                    id: datum.id,
                    name: datum.entity.name,
                    baseline: datum.percentage,
                    data: keys.map((key) => {
                        const range = datum.buckets.find((bucket) => bucket.id === key)

                        return {
                            index: key,
                            count: range?.count ?? 0,
                            percentage: range?.range_percentage ?? 0,
                            percentageDelta: range?.range_percentage_delta ?? 0,
                        }
                    }),
                }
            }),
        [dimensionData, keys]
    )

    return (
        <Block block={block} data={data}>
            <SwitcherContainer>
                <Switcher setDimension={setDimension} dimension={dimension} />
            </SwitcherContainer>
            <ChartContainer
                style={{
                    height: CHART_MARGIN.top + normalizedData.length * 60 + CHART_MARGIN.bottom,
                }}
            >
                <UsageVariationsChart
                    data={normalizedData}
                    keys={keys}
                    i18nNamespace={dimension}
                    margin={CHART_MARGIN}
                />
            </ChartContainer>
        </Block>
    )
}

const SwitcherContainer = styled.div`
    max-width: ${MAX_WIDTH}px;
    padding: 0 ${CHART_MARGIN.right}px 0 ${CHART_MARGIN.left}px;
    display: flex;
    justify-content: center;
`

const ChartContainer = styled.div`
    max-width: ${MAX_WIDTH}px;
`
