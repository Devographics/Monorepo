import React from 'react'
import './MultiItems.scss'
import { ChartState, ColumnId, OrderOptions } from './types'
import { useI18n } from '@devographics/react-i18n'
import Tooltip from 'core/components/Tooltip'
import T from 'core/i18n/T'

export const ColumnHeading = ({
    columnId,
    width,
    offset,
    chartState
}: {
    columnId: ColumnId
    width: number
    offset: number
    chartState: ChartState
}) => {
    const { getString } = useI18n()
    const { sort, setSort, order, setOrder, grouping } = chartState
    const style = {
        '--width': width,
        '--offset': offset
    }
    const isEnabled = sort === columnId
    const columnLabelId = `options.${grouping}.${columnId}.label.short`
    const columnLabel = getString(columnLabelId)?.t
    const orderLabel = getString(`charts.order.${order}`)?.t
    return (
        <div className="multiexp-column-heading" style={style}>
            <h3>
                <T k={`options.${grouping}.${columnId}.label.short`} />
            </h3>
            <Tooltip
                trigger={
                    <button
                        className={`column-heading-sort column-heading-order-${order} ${
                            isEnabled ? 'column-heading-sort-enabled' : ''
                        }`}
                        onClick={e => {
                            e.preventDefault()
                            if (isEnabled) {
                                setOrder(
                                    order === OrderOptions.ASC
                                        ? OrderOptions.DESC
                                        : OrderOptions.ASC
                                )
                            } else {
                                setSort(columnId)
                            }
                        }}
                    >
                        <span className="order-asc">↑</span>
                        <span className="order-desc">↓</span>
                    </button>
                }
                contents={
                    <T
                        k={isEnabled ? 'charts.sorted_by_sort_order' : 'charts.sort_by_sort'}
                        values={{ sort: columnLabel, order: orderLabel }}
                        md={true}
                    />
                }
            />
        </div>
    )
}
