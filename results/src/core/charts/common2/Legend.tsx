import './Legend.scss'
import React from 'react'
import { ChartValues } from '../multiItemsExperience/types'
import { OptionMetadata, QuestionMetadata } from '@devographics/types'
import { useColorScale } from '../horizontalBar2/helpers/colors'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import { getQuestionOptions } from '../horizontalBar2/helpers/options'
import { ChartState } from '../horizontalBar2/types'
import Tooltip from 'core/components/Tooltip'
import { OrderOptions } from './types'
import T from 'core/i18n/T'
import BlockQuestion from 'core/blocks/block/BlockQuestion'
import { getBlockKey } from 'core/helpers/blockHelpers'
import { BlockDefinition } from 'core/types'

export const Legend = ({
    chartState,
    chartValues
}: {
    chartState: ChartState
    chartValues: ChartValues
}) => {
    const { facetQuestion: question } = chartValues
    if (!question) {
        return null
    }
    const options = getQuestionOptions({ question, chartState })
    const colorScale = chartValues?.facetQuestion && useColorScale({ question })

    if (!options) {
        return null
    } else {
        return (
            <div className="chart-legend">
                {options.map(option => (
                    <LegendItem
                        key={option.id}
                        chartState={chartState}
                        chartValues={chartValues}
                        option={option}
                        color={colorScale[option.id]}
                    />
                ))}
            </div>
        )
    }
}

const LegendItem = ({
    chartState,
    option,
    color,
    chartValues
}: {
    chartState: ChartState
    option: OptionMetadata
    color: string
    chartValues: ChartValues
}) => {
    const { getString } = useI18n()

    const { facetQuestion } = chartValues

    const { id, entity } = option
    const { label, shortLabel, key } = getItemLabel({
        id,
        entity,
        getString,
        i18nNamespace: facetQuestion?.id
    })

    const { sort, setSort, order, setOrder } = chartState
    const isEnabled = sort === id
    const columnLabel = label
    const orderLabel = getString(`charts.order.${order}`)?.t

    const style = {
        '--color': color[0]
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
                        {shortLabel}
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
