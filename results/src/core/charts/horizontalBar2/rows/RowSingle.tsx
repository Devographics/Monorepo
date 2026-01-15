import React from 'react'
import { RowWrapper } from './RowWrapper'
import { Cell } from '../HorizontalBarCell'
import { RowComponentProps } from '../types'
import { useTheme } from 'styled-components'
import { RespondentCount } from '../../common2'
import { FreeformAnswersTrigger } from '../../common2/freeform_answers/FreeformAnswersTrigger'
import { CUTOFF_ANSWERS, OVERLIMIT_ANSWERS } from '@devographics/constants'
import { InsufficientDataIndicator } from 'core/charts/common2/InsufficientDataIndicator'
import { ResultsSubFieldEnum } from '@devographics/types'
import { getTopBound } from '../views'

export const RowSingle = (props: RowComponentProps) => {
    const theme = useTheme()
    const {
        block,
        bucket,
        buckets,
        chartState,
        chartValues,
        showCount = true,
        hasNestedBuckets,
        showNestedBuckets,
        setShowNestedBuckets,
        viewDefinition,
        otherBuckets,
        otherBucketsType,
        depth = 0
    } = props
    const { isFreeformData, hasInsufficientData } = bucket
    const otherBucket = otherBuckets && otherBuckets.find(b => b.id === bucket.id)
    const { question, maxOverallValue = 1, serieMetadataProps } = chartValues
    const { completion } = serieMetadataProps
    const { count: totalSerieRespondents } = completion

    const { getValue } = viewDefinition
    const value = getValue(bucket)
    let widthValue = value
    let oversizedBar = false
    if (widthValue > 100) {
        widthValue = 100
        oversizedBar = true
    }

    const getWidth = (widthValue: number) => {
        return Math.min(100, (100 * widthValue) / getTopBound(maxOverallValue))
    }

    let gradient

    if (question?.template === 'opinion') {
        gradient =
            theme?.colors?.ranges?.opinions?.[bucket.id] || theme.colors.barChart.primaryGradient
    } else {
        // const gradientsByDepth = [
        //     theme.colors.barChart.primaryGradient,
        //     theme.colors.barChart.secondaryGradient,
        //     theme.colors.barChart.ternaryGradient || theme.colors.barChart.secondaryGradient,
        //     theme.colors.barChart.quaternaryGradient || theme.colors.barChart.secondaryGradient
        // ]

        // gradient = showNestedBuckets ? gradientsByDepth[depth + 1] : gradientsByDepth[depth]
        gradient = theme.colors.barChart.primaryGradient
    }

    // TODO: do this better
    const isFreeformQuestion =
        block.queryOptions?.subField === ResultsSubFieldEnum.FREEFORM ||
        (block.template &&
            ['multiple_options2_freeform'].includes(block.template) &&
            block.id !== 'source')

    const isSpecialBucket = [OVERLIMIT_ANSWERS, CUTOFF_ANSWERS].includes(bucket.id)
    const showFreeformAnswers = !isSpecialBucket && (isFreeformQuestion || isFreeformData)

    const rowMetadata = showFreeformAnswers ? (
        <FreeformAnswersTrigger
            bucket={bucket}
            buckets={buckets}
            questionId={question.id}
            sectionId={block.sectionId}
            block={block}
            enableModal={true}
        />
    ) : (
        <RespondentCount count={bucket.count} />
    )
    const rowWrapperProps = showCount ? { ...props, rowMetadata } : props

    return (
        <RowWrapper {...rowWrapperProps}>
            <>
                <Cell
                    block={block}
                    bucket={bucket}
                    otherBucket={otherBucket}
                    otherBucketsType={otherBucketsType}
                    chartState={chartState}
                    getWidth={getWidth}
                    offset={0}
                    cellIndex={0}
                    chartValues={chartValues}
                    gradient={gradient}
                    viewDefinition={viewDefinition}
                    oversizedBar={oversizedBar}
                    parentTotal={totalSerieRespondents}
                    showNestedBuckets={showNestedBuckets}
                    setShowNestedBuckets={setShowNestedBuckets}
                />
                {hasInsufficientData && (
                    <div className="chart-row-insufficient-data-wrapper">
                        <InsufficientDataIndicator />
                    </div>
                )}
            </>
        </RowWrapper>
    )
}
