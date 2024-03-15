import React from 'react'
import { ChartState, ColumnId, CombinedBucket, Totals } from '../multiItemsExperience/types'
import Tooltip from 'core/components/Tooltip'
import { useI18n } from '@devographics/react-i18n'
import { Bucket, FacetBucket } from '@devographics/types'

export const Cell = ({
    bucket,
    chartState,
    width,
    offset,
    color
}: {
    bucket: Bucket | FacetBucket
    chartState: ChartState
    width: number
    offset: number
    color?: string
}) => {
    const { getString } = useI18n()

    const value = 123

    const style = {
        '--percentageValue': value,
        '--width': width,
        '--offset': offset,
        '--color': color
    }

    return (
        <Tooltip
            trigger={
                <div className="horizontal-chart-cell" style={style}>
                    {bucket.percentageQuestion}%
                </div>
            }
            contents={
                <div>
                    foo
                    {/* <T
                        k={`charts.multiexp.cell_tooltip.grouped_by_${grouping}`}
                        values={values}
                        html={true}
                        md={true}
                    /> */}
                </div>
            }
        />
    )
}
