import React from 'react'
import { RowWrapper } from './RowWrapper'
import { Cell } from '../HorizontalBarCell'
import { RowComponentProps } from '../types'
import { useTheme } from 'styled-components'
import { FreeformIndicator, RespondentCount } from '../../common2'
import { FreeformAnswersTrigger } from '../../common2/FreeformAnswers'

export const RowSingle = (props: RowComponentProps) => {
    const theme = useTheme()
    const { block, bucket, chartState, chartValues, showCount = true, hasGroupedBuckets } = props
    const { isFreeformData } = bucket
    const { question, maxOverallValue = 1 } = chartValues
    const { viewDefinition } = chartState
    const { getValue } = viewDefinition
    const value = getValue(bucket)
    const width = (100 * value) / maxOverallValue
    const gradient = theme.colors.barChart.primaryGradient

    // TODO: do this better
    const isFreeformQuestion =
        block.template &&
        ['multiple_options2_freeform'].includes(block.template) &&
        block.id !== 'source'

    const rowMetadata =
        isFreeformQuestion || isFreeformData ? (
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
