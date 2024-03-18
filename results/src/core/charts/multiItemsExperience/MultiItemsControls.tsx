import React from 'react'
import { ChartState, GroupingOptions } from './types'
import { useI18n } from '@devographics/react-i18n'
import { SplitIcon, StackedIcon } from 'core/icons'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { ColumnModes } from '../common2/types'

const icons = {
    [ColumnModes.SPLIT]: SplitIcon,
    [ColumnModes.STACKED]: StackedIcon
}

export const MultiItemsExperienceControls = ({ chartState }: { chartState: ChartState }) => {
    const { getString } = useI18n()
    const { grouping, setGrouping, sort, setSort, order, setOrder, columnMode, setColumnMode } =
        chartState
    return (
        <div className="multiexp-controls">
            <div />
            <div className="multiexp-control multiexp-control-grouping">
                <h4>{getString('charts.group_by')?.t}</h4>
                <ButtonGroup>
                    {Object.values(GroupingOptions).map(id => {
                        const isChecked = grouping === id
                        return (
                            <Button
                                key={id}
                                size="small"
                                className={`Button--${isChecked ? 'selected' : 'unselected'}`}
                                onClick={() => {
                                    setGrouping(id)
                                    // setSort(sortOptions[id][0])
                                }}
                                aria-pressed={isChecked}
                            >
                                <T k={`charts.group.${id}`} />
                            </Button>
                        )
                    })}
                </ButtonGroup>
            </div>

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
                            className={`radio ${isChecked ? 'radio-checked' : 'radio-unchecked'}`}
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
        </div>
    )
}
