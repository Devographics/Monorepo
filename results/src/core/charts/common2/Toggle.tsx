import './Toggle.scss'
import React, { SyntheticEvent, useEffect, useRef, useState } from 'react'
import { useI18n } from '@devographics/react-i18n'
import Tooltip from 'core/components/Tooltip'
import T from 'core/i18n/T'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'
import { useWidth } from './helpers'
import sum from 'lodash/sum'
import { OrderOptions } from '@devographics/types'

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

export type ToggleValueType = string | number

export type ToggleItemType = {
    label: string
    labelKey?: string
    id: ToggleValueType
    isEnabled: boolean
    className?: string
    tooltip?: JSX.Element
    gradient?: string[]
    icon?: JSX.Element
}

type ToggleProps = {
    alwaysExpand?: boolean
    labelId?: string
    items: ToggleItemType[]
    handleSelect?: (id: ToggleValueType | null) => void
    handleHover?: (id: ToggleValueType | null) => void
    hasDefault?: boolean
    // id of the currently active sort
    sortId?: string | null
    // whether the currently active sort is asc/desc
    sortOrder?: OrderOptions | null
    wrapItems?: boolean
}

export const DEFAULT_SORT = 'default'

export const Toggle = ({
    sortId,
    sortOrder,
    alwaysExpand = false,
    labelId,
    items,
    handleSelect,
    handleHover,
    hasDefault = false,
    wrapItems = true
}: ToggleProps) => {
    const [useDropdown, setUseDropdown] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const currentWidth = useWidth(ref)
    const minimumWidth = getMinToggleWidth(items)

    const commonProps = { handleSelect, handleHover, hasDefault, items, sortId, sortOrder }

    useEffect(() => {
        // note: only make calculation once currentWidth is defined
        if (currentWidth && !wrapItems) {
            const isSmushed = currentWidth < minimumWidth
            setUseDropdown(isSmushed)
        }
    }, [currentWidth]) // The empty dependency array makes sure this runs only once after component mount

    const className = `chart-toggle chart-toggle-order-${sortOrder} chart-toggle-${
        wrapItems ? 'wrap' : 'nowrap'
    }`
    return (
        <div className={className}>
            {labelId && (
                <h4 className="chart-toggle-heading">
                    <T k={labelId} />
                </h4>
            )}
            <div
                className={`chart-toggle-control chart-toggle-control-${
                    useDropdown ? 'dropdown' : 'buttongroup'
                }`}
                ref={ref}
            >
                {!alwaysExpand && useDropdown ? (
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
    const props: { onChange?: (e: SyntheticEvent) => void } = {}
    if (handleSelect) {
        props.onChange = e => {
            handleSelect((e.target as HTMLSelectElement).value)
        }
    }
    return (
        <select className="chart-toggle-dropdown chart-toggle-items" {...props}>
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
        <option value={id} data-key={labelKey}>
            {label || labelKey}
        </option>
    )
}

const SegmentedControl = ({
    handleSelect,
    handleHover,
    items,
    sortId,
    sortOrder
}: Pick<
    ToggleProps,
    'handleSelect' | 'handleHover' | 'hasDefault' | 'items' | 'sortId' | 'sortOrder'
>) => {
    return (
        <ButtonGroup className="chart-toggle-buttongroup chart-toggle-items">
            {items.map(item => (
                <SegmentedControlItem
                    key={item.id}
                    item={item}
                    handleSelect={handleSelect}
                    handleHover={handleHover}
                    sortId={sortId}
                    sortOrder={sortOrder}
                />
            ))}
        </ButtonGroup>
    )
}

const SegmentedControlItem = ({
    item,
    handleSelect,
    handleHover,
    sortId,
    sortOrder
}: {
    item: ToggleItemType
    handleSelect: ToggleProps['handleSelect']
    handleHover: ToggleProps['handleHover']
    sortId: ToggleProps['sortId']
    sortOrder: ToggleProps['sortOrder']
}) => {
    const { label, labelKey, id, isEnabled, gradient, className, tooltip, icon } = item
    const ref = useRef<HTMLDivElement>(null)
    const props: {
        onClick?: (e: SyntheticEvent) => void
        onMouseEnter?: (e: SyntheticEvent) => void
        onMouseLeave?: (e: SyntheticEvent) => void
    } = {}
    if (handleSelect) {
        props.onClick = (e: SyntheticEvent) => {
            e.preventDefault()
            handleSelect(id)
        }
    }
    if (handleHover) {
        props.onMouseEnter = () => {
            handleHover(id)
        }
        props.onMouseLeave = () => {
            handleHover(null)
        }
    }
    const Icon = icon
    const component = (
        <Button
            className={`chart-toggle-item column-heading chart-toggle-item-${
                isEnabled ? 'enabled' : 'disabled'
            } ${className}`}
            size="small"
            {...props}
            ref={ref}
        >
            {icon && <Icon size="petite" />}
            {gradient && <ItemColor gradient={gradient} />}
            <span className="legend-item-label" data-key={labelKey}>
                {label || labelKey}
            </span>
            {/* <CellLabel label={shortLabel} /> */}
            {sortId && sortId === id && sortOrder && <SortIndicator sortOrder={sortOrder} />}
        </Button>
    )
    // if no tooltip is specified just show label
    // useful for when label is truncated using overflow-ellipsis
    return tooltip ? (
        <Tooltip trigger={component} contents={tooltip} showBorder={false} />
    ) : (
        <Tooltip trigger={component} contents={label} showBorder={false} />
    )
}

const SortIndicator = ({ sortOrder }: { sortOrder: OrderOptions }) => {
    if (sortOrder === OrderOptions.ASC) {
        return <span className="order-asc">↑</span>
    } else if (sortOrder === OrderOptions.DESC) {
        return <span className="order-desc">↓</span>
    } else {
        return null
    }
}
const ItemColor = ({ gradient }: { gradient: string[] }) => {
    const style = {
        '--color1': gradient[0],
        '--color2': gradient[1]
    }
    return <div style={style} className="legend-item-color" />
}

export default Toggle
