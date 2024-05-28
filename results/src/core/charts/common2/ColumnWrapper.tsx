import React from 'react'
import { RowCommonProps, RowExtraProps } from '../common2/types'
import { RowDataProps } from './types'

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
        rowIndex
    } = props

    return (
        <div className="chart-column">
            {rowMetadata && <div className="chart-column-top">{rowMetadata}</div>}

            <div className="chart-column-content">
                {/* {ticks && <Gridlines ticks={ticks} />} */}
                <div className="chart-bar">{children}</div>
            </div>

            <div className="chart-column-bottom">
                <div className="chart-row-index">{rowIndex + 1}</div>
                <ColumnHeading {...props} />
            </div>
        </div>
    )
}

const ColumnHeading = ({ edition }) => {
    return <div>{edition.year}</div>
}
