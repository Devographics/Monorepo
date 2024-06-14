import './Toggle.scss'
import React, { SyntheticEvent, useRef } from 'react'
import { useI18n } from '@devographics/react-i18n'
import Tooltip from 'core/components/Tooltip'
import T from 'core/i18n/T'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'
import { useWidth } from './helpers'
import sum from 'lodash/sum'

// Calculate minimum width for a legend item to be readable

// how much padding each item has on each side (10px left padding + 10px right padding + 1px border)
const PADDING_PER_ITEM = 21
// the width of a single character
const MIN_WIDTH_PER_CHAR = 8
// how much we can tolerate a label getting smushed (about 70%)
const RATIO = 0.7

const getMinToggleWidth = (items: ToggleItemType[]) =>
    sum(items.map(item => item.label.length * MIN_WIDTH_PER_CHAR)) * RATIO +
    items.length * PADDING_PER_ITEM

export type ToggleItemType = {
    label: string
    id: string | number
    isEnabled: boolean
    className?: string
    tooltip?: JSX.Element
    gradient?: string[]
}

type ToggleProps = {
    labelId: string
    items: ToggleItemType[]
    handleSelect: (id: string) => void
    hasDefault?: boolean
}

const DEFAULT_SORT = 'default'

export const Toggle = ({ labelId, items, handleSelect, hasDefault = false }: ToggleProps) => {
    const { getString } = useI18n()

    const ref = useRef<HTMLDivElement>(null)
    const currentWidth = useWidth(ref) || 0
    const minimumWidth = getMinToggleWidth(items)
    // TODO: maybe use actual width of elements; or even do it via CSS via container query?
    const useDropdown = currentWidth < minimumWidth
    return (
        <div className="chart-toggle">
            <h4 className="chart-toggle-heading">
                <T k={labelId} />
            </h4>
            <div
                className={`chart-toggle-control chart-toggle-control-${
                    useDropdown ? 'dropdown' : 'buttongroup'
                }`}
                ref={ref}
            >
                {useDropdown ? (
                    <select
                        className="chart-toggle-dropdown chart-toggle-items"
                        onChange={e => {
                            handleSelect(e.target.value)
                        }}
                    >
                        {hasDefault && (
                            <option value={DEFAULT_SORT}>
                                {getString('filters.legend.default')?.t}
                            </option>
                        )}
                        {items.map(item => (
                            <SelectItem key={item.id} item={item} />
                        ))}
                    </select>
                ) : (
                    <ButtonGroup className="chart-toggle-buttongroup chart-toggle-items">
                        {items.map(item => (
                            <ToggleItem key={item.id} item={item} handleSelect={handleSelect} />
                        ))}
                    </ButtonGroup>
                )}
            </div>
        </div>
    )
}

const ToggleItem = ({
    item,
    handleSelect
}: {
    item: ToggleItemType
    handleSelect: ToggleProps['handleSelect']
}) => {
    const { label, id, isEnabled, gradient, className, tooltip } = item
    const ref = useRef<HTMLDivElement>(null)
    console.log(item.id)
    console.log(ref.current?.scrollWidth)
    console.log(ref.current?.offsetWidth)

    const component = (
        <Button
            className={`chart-toggle-item column-heading ${className}`}
            size="small"
            onClick={(e: SyntheticEvent) => {
                e.preventDefault()
                handleSelect(String(id))
            }}
            ref={ref}
        >
            {gradient && <ItemColor gradient={gradient} />}
            <span className="legend-item-label">{label}</span>
            {/* <CellLabel label={shortLabel} /> */}
            <span className="order-asc">↑</span>
            <span className="order-desc">↓</span>
        </Button>
    )
    return tooltip ? <Tooltip trigger={component} contents={tooltip} /> : component
}

const ItemColor = ({ gradient }: { gradient: string[] }) => {
    const style = {
        '--color1': gradient[0],
        '--color2': gradient[1]
    }
    return <div style={style} className="legend-item-color" />
}

const SelectItem = ({ item }: { item: ToggleItemType }) => {
    const { label, id } = item
    return <option value={id}>{label}</option>
}

export default Toggle
