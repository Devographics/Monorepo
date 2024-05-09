import React from 'react'
import { RowWrapper } from '../common2/RowWrapper'
import { Cell } from './HorizontalBarCell'
import { RowCommonProps, RowExtraProps } from '../common2/types'
import { RowDataProps } from './types'
import { getViewDefinition } from './helpers/views'
import { useGradient } from './helpers/colors'
import { useTheme } from 'styled-components'
import { FreeformIndicator, RespondentCount } from '../common2'
import { FreeformAnswersTrigger } from '../common2/FreeformAnswers'

export const SingleBarRow = (props: RowDataProps & RowCommonProps & RowExtraProps) => {
    const theme = useTheme()
    const { block, bucket, chartState, chartValues, showCount = true, hasGroupedBuckets } = props
    const { isFreeformData } = bucket
    const { question, maxOverallValue = 1 } = chartValues
    const viewDefinition = getViewDefinition(chartState.view)
    const { getValue } = viewDefinition
    const value = getValue(bucket)
    const width = (100 * value) / maxOverallValue
    const gradient = theme.colors.barChart.primaryGradient

    const isFreeformQuestion =
        block.template &&
        ['multiple_options2_freeform'].includes(block.template) &&
        block.id !== 'source'

    const rowMetadata = isFreeformQuestion ? (
        <FreeformAnswersTrigger
            bucket={bucket}
            questionId={question.id}
            sectionId={block.sectionId}
            block={block}
            enableModal={!hasGroupedBuckets}
        />
    ) : (
        <RespondentCount count={bucket.count} />
    )
    const rowWrapperProps = showCount ? { ...props, rowMetadata } : props

    return (
        <RowWrapper {...rowWrapperProps}>
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
    const { bucket, chartState, chartValues, rowIndex, allRowsCellDimensions, allRowsOffsets } =
        props
    const { facetQuestion } = chartValues
    const { facetBuckets } = bucket

    const rowDimensions = allRowsCellDimensions[rowIndex]
    const rowOffset = allRowsOffsets[rowIndex]

    return (
        <RowWrapper {...props} rowMetadata={<RespondentCount count={bucket.count} />}>
            <div className="chart-faceted-bar">
                {facetBuckets.map((facetBucket, index) => {
                    const { id } = facetBucket
                    const { width, offset } = rowDimensions[index]
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
