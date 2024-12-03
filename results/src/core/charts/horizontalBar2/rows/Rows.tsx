import './Rows.scss'
import React from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import Axis from '../../common2/Axis'
import { ShowAll } from '../../common2/ShowAll'
import { HorizontalBarViewProps } from '../types'
import { applyRowsLimit } from 'core/charts/multiItemsExperience/helpers'
import { getViewDefinition } from '../helpers/views'

export const Rows = ({
    chartState,
    chartValues,
    children,
    labelId,
    hasZebra = false,
    buckets
}: HorizontalBarViewProps & {
    children: React.ReactNode
    labelId?: string
    hasZebra?: boolean
}) => {
    const [parent, enableAnimations] = useAutoAnimate(/* optional config */)
    const { ticks, question } = chartValues

    const { view } = chartState
    const viewDefinition = getViewDefinition(view)
    const { formatValue } = viewDefinition
    const axisProps = { question, formatValue, labelId }
    return (
        <div className={`chart-rows ${hasZebra ? 'chart-rows-zebra' : ''}`} ref={parent}>
            {ticks && <Axis variant="top" {...axisProps} ticks={ticks} />}

            {children}

            {applyRowsLimit(chartState.rowsLimit, chartValues.totalRows) ? (
                <ShowAll chartState={chartState} chartValues={chartValues} />
            ) : null}

            {ticks && labelId && <Axis variant="bottom" {...axisProps} ticks={ticks} />}
        </div>
    )
}

export default Rows
