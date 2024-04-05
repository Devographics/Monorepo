import './ShowAll.scss'
import React from 'react'
import Button from 'core/components/Button'
import { ChartState } from '../horizontalBar2/types'
import T from 'core/i18n/T'
import { Bucket } from '@devographics/types'
import { ChartValues } from '../multiItemsExperience/types'

export const ShowAll = ({
    chartState,
    chartValues
}: {
    chartState: ChartState
    chartValues: ChartValues
}) => {
    return (
        <div className="chart-showall">
            <Button
                onClick={() => {
                    chartState.setRowsLimit(0)
                }}
            >
                <T
                    k="charts.show_all_rows.x_hidden"
                    values={{ count: chartValues.totalRows - chartState.rowsLimit }}
                />
            </Button>
        </div>
    )
}
