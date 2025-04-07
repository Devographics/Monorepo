import { CommonProps } from 'core/charts/common2/types'
import React from 'react'
import { HorizontalBarChartState, HorizontalBarViewProps } from '../types'
import { formatQuestionValue } from 'core/charts/common2/helpers/format'
import './AverageMarker.scss'
import { Bucket, QuestionMetadata } from '@devographics/types'
import maxBy from 'lodash/maxBy'
import T from 'core/i18n/T'

export const isInBounds = (n: number, lowerBound?: number, upperBound?: number) => {
    if (typeof lowerBound !== 'undefined' && typeof upperBound !== 'undefined') {
        return n >= lowerBound && n < upperBound
    } else if (typeof lowerBound !== 'undefined') {
        return n >= lowerBound
    } else if (typeof upperBound !== 'undefined') {
        return n < upperBound
    } else {
        throw new Error(`isInBounds: no bounds specified`)
    }
}

const getOffsetCoefficient = (question: QuestionMetadata, buckets: Bucket[], average: number) => {
    const { options, groups, optionsAreRange } = question
    if ((optionsAreRange && options) || groups) {
        // if options are range or we're dealing with groups, then
        // each bar represents a range of possible values
        // and we need to make sure the average marker falls within the
        // height bounds of the relevant bar
        const optionsOrGroups = groups || options
        if (optionsOrGroups) {
            const relevantBarIndex = optionsOrGroups?.findIndex(
                og =>
                    (og.lowerBound || og.upperBound) &&
                    isInBounds(average, og.lowerBound, og.upperBound)
            )
            const totalBars = optionsOrGroups.length
            const halfBarOffset = 1 / (totalBars * 2)
            return (relevantBarIndex + 1) / totalBars - halfBarOffset
        }
    } else {
        const maxValue = maxBy(options, 'average')?.average
        if (maxValue === undefined) {
            return
        }
        return average / maxValue
    }
    return
}
export const AverageMarker = (
    props: CommonProps<HorizontalBarChartState> & HorizontalBarViewProps
) => {
    const { serieMetadataProps, question, buckets } = props
    const { average } = serieMetadataProps
    if (question && average) {
        const averageFormatted = formatQuestionValue(average, question)
        const offset = getOffsetCoefficient(question, buckets, average)
        if (offset === undefined) {
            return null
        }
        const style = {
            '--offsetCoefficient': offset,
            '--numberOfRows': buckets.length
        }
        return (
            <div style={style} className="chart-row chart-average-marker chart-subgrid">
                <div className="chart-average-marker-inner chart-row-content">
                    <div className="chart-average-marker-label">
                        <T
                            k="charts.average.marker"
                            md={true}
                            values={{ value: averageFormatted }}
                        />
                    </div>
                </div>
            </div>
        )
    } else {
        return null
    }
}
