import './Legend.scss'
import React from 'react'
import { ChartValues } from '../multiItemsExperience/types'
import { Option, OptionMetadata, QuestionMetadata } from '@devographics/types'
import { ColorScale, neutralColor, useColorScale } from '../horizontalBar2/helpers/colors'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import { getQuestionOptions } from '../horizontalBar2/helpers/options'
import { ChartState } from '../horizontalBar2/types'
import Tooltip from 'core/components/Tooltip'
import { OrderOptions } from './types'
import T from 'core/i18n/T'

type LegendProps = {
    chartState: ChartState
    i18nNamespace: string
    options: Option[]
    colorScale: ColorScale
}

export const Legend = ({ chartState, i18nNamespace, options, colorScale }: LegendProps) => {
    return (
        <div className="chart-legend">
            <h4 className="chart-legend-heading">
                <T k="charts.sort_by" />
            </h4>
            {options.map(option => (
                <LegendItem
                    key={option.id}
                    chartState={chartState}
                    i18nNamespace={i18nNamespace}
                    option={option}
                    gradient={colorScale?.[option.id] || [neutralColor, neutralColor]}
                />
            ))}
        </div>
    )
}

const LegendItem = ({
    chartState,
    option,
    gradient,
    i18nNamespace
}: {
    chartState: LegendProps['chartState']
    option: OptionMetadata
    gradient: string[]
    i18nNamespace: LegendProps['i18nNamespace']
}) => {
    const { getString } = useI18n()

    const { id, entity } = option
    const { label, shortLabel, key } = getItemLabel({
        id,
        entity,
        getString,
        i18nNamespace
    })

    const { sort, setSort, order, setOrder } = chartState
    const isEnabled = sort === id
    const columnLabel = shortLabel
    const orderLabel = getString(`charts.order.${order}`)?.t

    const style = {
        '--color1': gradient[0],
        '--color2': gradient[1]
    }
    return (
        <div style={style} className="legend-item">
            <Tooltip
                trigger={
                    <button
                        className={`column-heading column-heading-sort column-heading-order-${order} ${
                            isEnabled ? 'column-heading-sort-enabled' : ''
                        }`}
                        onClick={e => {
                            e.preventDefault()
                            if (!isEnabled) {
                                setSort(id as string)
                                setOrder(OrderOptions.ASC)
                            } else if (sort && order === OrderOptions.ASC) {
                                setOrder(OrderOptions.DESC)
                            } else {
                                setSort(undefined)
                                setOrder(OrderOptions.ASC)
                            }
                        }}
                    >
                        <div className="legend-item-color" />
                        <span>{shortLabel}</span>
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

export default Legend
