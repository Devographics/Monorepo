import React from 'react'
import { MultiItemsChartState, GroupingOptions } from './types'
import { useI18n } from '@devographics/react-i18n'
import { SplitIcon, StackedIcon } from 'core/icons'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { ColumnModes } from '../common2/types'
import { sortOptions } from './MultiItemsBlock'
import { Toggle } from '../common2'

const icons = {
    [ColumnModes.SPLIT]: SplitIcon,
    [ColumnModes.STACKED]: StackedIcon
}

export const MultiItemsExperienceControls = ({
    chartState
}: {
    chartState: MultiItemsChartState
}) => {
    const { getString } = useI18n()
    const { grouping, setGrouping, sort, setSort, order, setOrder, columnMode, setColumnMode } =
        chartState
    const items = Object.values(GroupingOptions).map(id => {
        const label = getString(`charts.group.${id}`)?.t
        const isEnabled = grouping === id
        return {
            id,
            label,
            isEnabled,
            tooltip: (
                <T
                    k={isEnabled ? 'charts.grouped_by_group' : 'charts.group_by_group'}
                    values={{ group: label }}
                    md={true}
                />
            )
        }
    })
    return (
        <div className="multiexp-controls">
            <div className="multiexp-control multiexp-control-grouping">
                <Toggle
                    labelId="charts.group_by"
                    handleSelect={(id: string) => {
                        setGrouping(id as GroupingOptions)
                    }}
                    items={items}
                />
            </div>

            {false && (
                <div className="multiexp-control multiexp-control-columns">
                    {/* <h4>{getString('charts.display_mode')?.t}</h4> */}
                    {Object.values(ColumnModes).map(option => {
                        const Icon = icons[option]
                        const isChecked = columnMode === option
                        const label = getString(`charts.display_mode.${option}`)?.t
                        return (
                            <label
                                key={option}
                                htmlFor={option}
                                className={`radio ${
                                    isChecked ? 'radio-checked' : 'radio-unchecked'
                                }`}
                            >
                                {Icon && <Icon label={label} />}{' '}
                                <input
                                    type="radio"
                                    id={option}
                                    name="grouping"
                                    value={option}
                                    checked={isChecked}
                                    onChange={() => setColumnMode(option)}
                                />
                            </label>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
