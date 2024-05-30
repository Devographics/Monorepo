import './Column.scss'
import React from 'react'
import { RowCommonProps, RowExtraProps } from '../../common2/types'
import { RowDataProps } from '../../common2/types'

export const ColumnWrapper = (
    props: RowDataProps &
        RowCommonProps &
        RowExtraProps & { rowMetadata?: JSX.Element; children: JSX.Element }
) => {
    const {
        chartState,
        ticks,
        bucket,
        isGroupedBucket = false,
        children,
        rowMetadata,
        rowIndex,
        edition
    } = props

    return (
        <div className="chart-column">
            {rowMetadata && <div className="chart-column-top">{rowMetadata}</div>}

            <div className="chart-column-content">
                {/* {ticks && <Gridlines ticks={ticks} />} */}
                <div className="chart-bar">{children}</div>
            </div>

            <div className="chart-column-bottom">
                <div className="chart-column-year">{edition.year}</div>
            </div>
        </div>
    )
}
