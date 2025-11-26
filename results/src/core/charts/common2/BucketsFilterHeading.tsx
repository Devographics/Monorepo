import React from 'react'
import { PageContextValue } from 'core/types'
import { QuestionMetadata, StandardQuestionData } from '@devographics/types'
import { BucketsFilterDefinition, DataSeries } from 'core/filters/types'
import { CommonProps } from '../common2/types'
import T from 'core/i18n/T'

const formatList = (list: string[]) => list.map(item => `<strong>${item}</strong>`).join(', ')
export const BucketsFilterHeading = (
    props: CommonProps<HorizontalBarChartState> & {
        series: DataSeries<StandardQuestionData>[]
        facetQuestion: QuestionMetadata
        chartState: HorizontalBarChartState
        pageContext: PageContextValue
        bucketsFilter: BucketsFilterDefinition
    }
) => {
    const { bucketsFilter } = props
    const keys = Object.keys(bucketsFilter)
    return (
        <div className="chart-grid-item-heading chart-grid-item-heading-bucketsFilter">
            {keys.map(filterKey => {
                const value = bucketsFilter[filterKey]
                // make sure value is array
                const values = Array.isArray(value) ? value : [value]
                return (
                    <T
                        key={filterKey}
                        k={`filters.bucketsFilter.${filterKey}`}
                        values={{ value: formatList(values) }}
                        html={true}
                        md={true}
                    />
                )
            })}
            {/* {eq && }
            {in_ && <T k="filters.bucketsFilter.in" values={{ value: formatList(in_) }} />}
            {nin && <T k="filters.bucketsFilter.nin" values={{ value: formatList(nin) }} />}
            {hasTags && (
                <T k="filters.bucketsFilter.hasTags" values={{ value: formatList(hasTags) }} />
            )} */}
        </div>
    )
}
export default BucketsFilterHeading
