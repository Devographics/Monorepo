import './Toggle.scss'
import React, { SyntheticEvent, useEffect, useRef, useState } from 'react'
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
    sum(items.map(item => (item?.label?.length || 0) * MIN_WIDTH_PER_CHAR)) * RATIO +
    items.length * PADDING_PER_ITEM

export type ToggleItemType = {
    label: string
    labelKey: string
    id: string | number | null
    isEnabled: boolean
    className?: string
    tooltip?: JSX.Element
    gradient?: string[]
}

type ToggleProps<ValueType> = {
    labelId: string
    items: ToggleItemType[]
    handleSelect: (id: ValueType) => void
    hasDefault?: boolean
}

const DEFAULT_SORT = 'default'

export const Toggle = <ValueType,>({
    labelId,
    items,
    handleSelect,
    hasDefault = false
}: ToggleProps<ValueType>) => {
    const [useDropdown, setUseDropdown] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const currentWidth = useWidth(ref)
    const minimumWidth = getMinToggleWidth(items)

    const commonProps = { handleSelect, hasDefault, items }

    useEffect(() => {
        // note: only make calculation once currentWidth is defined
        if (currentWidth) {
            const isSmushed = currentWidth < minimumWidth
            setUseDropdown(isSmushed)
        }
    }, [currentWidth]) // The empty dependency array makes sure this runs only once after component mount

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
                    <Dropdown {...commonProps} />
                ) : (
                    <SegmentedControl {...commonProps} />
                )}
            </div>
        </div>
    )
}

const Dropdown = ({
    handleSelect,
    hasDefault,
    items
}: Pick<ToggleProps, 'handleSelect' | 'hasDefault' | 'items'>) => {
    const { getString } = useI18n()

    return (
        <select
            className="chart-toggle-dropdown chart-toggle-items"
            onChange={e => {
                handleSelect(e.target.value)
            }}
        >
            {hasDefault && (
                <option value={DEFAULT_SORT}>{getString('filters.legend.default')?.t}</option>
            )}
            {items.map(item => (
                <DropdownItem key={item.id} item={item} />
            ))}
        </select>
    )
}

const DropdownItem = ({ item }: { item: ToggleItemType }) => {
    const { label, id, labelKey } = item
    return (
        <option value={id} data-labelKey={labelKey}>
            {label}
        </option>
    )
}

const SegmentedControl = ({
    handleSelect,
    items
}: Pick<ToggleProps, 'handleSelect' | 'hasDefault' | 'items'>) => {
    return (
        <ButtonGroup className="chart-toggle-buttongroup chart-toggle-items">
            {items.map(item => (
                <SegmentedControlItem key={item.id} item={item} handleSelect={handleSelect} />
            ))}
        </ButtonGroup>
    )
}

const SegmentedControlItem = ({
    item,
    handleSelect
}: {
    item: ToggleItemType
    handleSelect: ToggleProps['handleSelect']
}) => {
    const { label, labelKey, id, isEnabled, gradient, className, tooltip } = item
    const ref = useRef<HTMLDivElement>(null)

    const component = (
        <Button
            className={`chart-toggle-item column-heading chart-toggle-item-${
                isEnabled ? 'enabled' : 'disabled'
            } ${className}`}
            size="small"
            onClick={(e: SyntheticEvent) => {
                e.preventDefault()
                handleSelect(id)
            }}
            ref={ref}
        >
            {gradient && <ItemColor gradient={gradient} />}
            <span className="legend-item-label" data-labelKey={labelKey}>
                {label}
            </span>
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

export default Toggle
