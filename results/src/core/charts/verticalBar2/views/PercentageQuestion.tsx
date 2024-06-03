import React from 'react'
import { ColumnStacked } from '../columns/ColumnStacked'
import { VerticalBarViewDefinition } from '../types'
// import { removeNoAnswer } from '../helpers/steps'
import { BucketUnits } from '@devographics/types'
import Columns from '../columns/Columns'
import { formatPercentage } from 'core/charts/common2/helpers/labels'
import { getEditionByYear } from '../helpers/other'
import { ColumnEmpty } from '../columns/ColumnEmpty'

export const PercentageQuestion: VerticalBarViewDefinition = {
    getBucketValue: bucket => bucket[BucketUnits.PERCENTAGE_QUESTION] || 0,
    formatValue: formatPercentage,
    getTicks: () => [
        { value: 0 },
        { value: 20 },
        { value: 40 },
        { value: 60 },
        { value: 80 },
        { value: 100 }
    ],
    dataFilters: [
        /*removeNoAnswer*/
    ],
    component: props => {
        const { chartValues } = props
        const { years } = chartValues
        return (
            <Columns {...props} hasZebra={true}>
                {years.map((year, i) => {
                    const edition = getEditionByYear(year, props.editions)
                    return edition ? (
                        <ColumnStacked
                            columnIndex={i}
                            {...props}
                            key={year}
                            year={year}
                            edition={edition}
                            showCount={false}
                        />
                    ) : (
                        <ColumnEmpty {...props} columnIndex={i} key={year} year={year} />
                    )
                })}
            </Columns>
        )
    }
}
