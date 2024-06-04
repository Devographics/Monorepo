import './Legend.scss'
import React, { SyntheticEvent, useRef } from 'react'
import { OptionMetadata } from '@devographics/types'
import { ColorScale, neutralColor } from '../horizontalBar2/helpers/colors'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import { HorizontalBarChartState } from '../horizontalBar2/types'
import Tooltip from 'core/components/Tooltip'
import { OrderOptions } from './types'
import T from 'core/i18n/T'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'
import { useWidth } from './helpers'

type LegendProps = {
    chartState: HorizontalBarChartState
    i18nNamespace: string
    options: OptionMetadata[]
    colorScale: ColorScale
}

const DEFAULT_SORT = 'default'
// minimum width for a legend item to be readable
const MIN_WIDTH_PER_ITEM = 90

export const Legend = ({ chartState, i18nNamespace, options, colorScale }: LegendProps) => {
    const { getString } = useI18n()

    const ref = useRef<HTMLDivElement>(null)
    const parentWidth = useWidth(ref) || 0
    const minimumWidth = options.length * MIN_WIDTH_PER_ITEM
    // TODO: maybe use actual width of elements; or even do it via CSS via container query?
    const useDropdown = parentWidth < minimumWidth

    const { sort, setSort, order, setOrder } = chartState

    const handleSelect = (optionId: string) => {
        const isEnabled = sort === optionId
        if (optionId === DEFAULT_SORT) {
            setSort(undefined)
            setOrder(OrderOptions.ASC)
        } else if (!isEnabled) {
            setSort(optionId as string)
            setOrder(OrderOptions.ASC)
        } else if (sort && order === OrderOptions.ASC) {
            setOrder(OrderOptions.DESC)
        } else {
            setSort(undefined)
            setOrder(OrderOptions.ASC)
        }
    }

    const optionProps = { chartState, i18nNamespace, handleSelect }

    const getGradient = (option: OptionMetadata) =>
        colorScale?.[option.id] || [neutralColor, neutralColor]

    return (
        <div className="chart-legend" ref={ref}>
            <h4 className="chart-legend-heading">
                <T k="charts.sort_by" />
            </h4>
            <div
                className={`chart-legend-control chart-legend-control-${
                    useDropdown ? 'dropdown' : 'buttongroup'
                }`}
            >
                {useDropdown ? (
                    <select
                        className="chart-legend-dropdown chart-legend-items"
                        onChange={e => {
                            handleSelect(e.target.value)
                        }}
                    >
                        <option value={DEFAULT_SORT}>
                            {getString('filters.legend.default')?.t}
                        </option>
                        {options.map(option => (
                            <SelectItem
                                {...optionProps}
                                key={option.id}
                                option={option}
                                gradient={getGradient(option)}
                            />
                        ))}
                    </select>
                ) : (
                    <ButtonGroup className="chart-legend-buttongroup chart-legend-items">
                        {options.map(option => (
                            <LegendItem
                                {...optionProps}
                                key={option.id}
                                option={option}
                                gradient={getGradient(option)}
                            />
                        ))}
                    </ButtonGroup>
                )}
            </div>
        </div>
    )
}

type ItemProps = {
    chartState: LegendProps['chartState']
    option: OptionMetadata
    gradient: string[]
    i18nNamespace: LegendProps['i18nNamespace']
    handleSelect: (optionId: string) => void
}

const LegendItem = ({ chartState, option, gradient, i18nNamespace, handleSelect }: ItemProps) => {
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
        <Tooltip
            trigger={
                <Button
                    style={style}
                    className={`chart-legend-item column-heading column-heading-sort column-heading-order-${order} ${
                        isEnabled ? 'column-heading-sort-enabled' : ''
                    }`}
                    size="small"
                    onClick={(e: SyntheticEvent) => {
                        e.preventDefault()
                        handleSelect(String(option.id))
                    }}
                >
                    <div className="legend-item-color" />
                    <span className="legend-item-label">{shortLabel}</span>
                    {/* <CellLabel label={shortLabel} /> */}
                    <span className="order-asc">↑</span>
                    <span className="order-desc">↓</span>
                </Button>
            }
            contents={
                <T
                    k={isEnabled ? 'charts.sorted_by_sort_order' : 'charts.sort_by_sort'}
                    values={{ sort: columnLabel, order: orderLabel }}
                    md={true}
                />
            }
        />
    )
}

const SelectItem = ({ option, i18nNamespace }: ItemProps) => {
    const { getString } = useI18n()

    const { id, entity } = option
    const { label, shortLabel, key } = getItemLabel({
        id,
        entity,
        getString,
        i18nNamespace
    })
    return <option value={option.id}>{label}</option>
}
export default Legend
