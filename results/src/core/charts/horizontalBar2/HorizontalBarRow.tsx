import React from 'react'
import { RowWrapper } from '../common2/RowWrapper'
import { Cell } from './HorizontalBarCell'
import { RowCommonProps, RowExtraProps } from '../common2/types'
import take from 'lodash/take'
import sum from 'lodash/sum'
import { RowDataProps } from './types'
import { getViewDefinition } from './helpers/views'
import { getRowOffset } from './helpers/other'
import { useGradient } from './helpers/colors'
import { useTheme } from 'styled-components'
import { FreeformIndicator } from '../common2'

export const SingleBarRow = (props: RowDataProps & RowCommonProps & RowExtraProps) => {
    const theme = useTheme()
    const { bucket, chartState, chartValues } = props
    const { isFreeformData } = bucket
    const { question, maxOverallValue = 1 } = chartValues
    const viewDefinition = getViewDefinition(chartState.view)
    const { getValue } = viewDefinition
    const value = getValue(bucket)
    const width = (100 * value) / maxOverallValue
    const gradient = theme.colors.barChart.primaryGradient

    return (
        <RowWrapper {...props}>
            <>
                <Cell
                    bucket={bucket}
                    chartState={chartState}
                    width={width}
                    offset={0}
                    cellIndex={0}
                    chartValues={chartValues}
                    gradient={gradient}
                />

                {isFreeformData && (
                    <div className="chart-row-freeform-icon-wrapper" style={{ '--offset': width }}>
                        <FreeformIndicator />
                    </div>
                )}
            </>
        </RowWrapper>
    )
}

export const FacetRow = (props: RowDataProps & RowCommonProps & RowExtraProps) => {
    const { buckets, bucket, chartState, chartValues } = props
    const viewDefinition = getViewDefinition(chartState.view)
    const { getValue } = viewDefinition
    const { maxOverallValue = 1, facetQuestion } = chartValues
    const { facetBuckets } = bucket

    const rowOffset = getRowOffset({ buckets, bucket, chartState })

    return (
        <RowWrapper {...props}>
            <div className="chart-faceted-bar">
                {facetBuckets.map((facetBucket, index) => {
                    const { id } = facetBucket
                    const value = getValue(facetBucket)
                    const ratio = 100 / maxOverallValue
                    const width = value * ratio
                    const offset = sum(
                        take(
                            facetBuckets.map(b => getValue(b) * ratio),
                            index
                        )
                    )
                    const gradient = useGradient({ id: facetBucket.id, question: facetQuestion })
                    return (
                        <Cell
                            key={id}
                            bucket={facetBucket}
                            chartState={chartState}
                            width={width}
                            offset={offset - rowOffset}
                            cellIndex={index}
                            chartValues={chartValues}
                            gradient={gradient}
                        />
                    )
                })}
            </div>
        </RowWrapper>
    )
}

export const BoxPlotRow = () => {
    return <div>boxplotrow</div>
}
