import React from 'react'
import { useI18n } from '@devographics/react-i18n'
import cloneDeep from 'lodash/cloneDeep.js'
import { getFormattedOptionValue, getValueLabel } from '../helpers'
import {
    PanelState,
    FilterValue,
    FilterValueString,
    FilterValueArray,
    FilterItem,
    OptionsOperatorEnum
} from '../types'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'
import { DeleteIcon, PlusIcon } from '@devographics/icons'
import { Input_, Label_, Select_ } from './FieldSegment'
import { OptionGroup, OptionMetadata, QuestionMetadata } from '@devographics/types'
import Button from 'core/components/Button'
import './ValueSegment.scss'

interface ValueSegmentProps<T> {
    seriesIndex: number
    conditionIndex: number
    stateStuff: PanelState
    options: OptionMetadata[]
    field: QuestionMetadata
    allFilters: FilterItem[]
    operator: OptionsOperatorEnum
    value: T
}

export const ValueSegment = (props: ValueSegmentProps<FilterValue>) => {
    const isArray = ['in', 'nin'].includes(props.operator)

    return isArray ? (
        <ValueSegmentArray {...(props as ValueSegmentArrayProps)} />
    ) : (
        <ValueSegmentField {...(props as ValueSegmentFieldProps)} />
    )
}

type ValueSegmentFieldProps = ValueSegmentProps<FilterValueString>

const ValueSegmentField = ({
    seriesIndex,
    conditionIndex,
    stateStuff,
    options,
    value,
    field,
    allFilters
}: ValueSegmentFieldProps) => {
    const { setFiltersState } = stateStuff
    const { getString } = useI18n()
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setFiltersState(fState => {
            const newState = cloneDeep(fState)
            newState.filters[seriesIndex].conditions[conditionIndex].value = value
            return newState
        })
    }
    const groupsOrOptions = field.groups || field.options
    const useNumericInput = field.optionsAreNumeric && !groupsOrOptions
    if (groupsOrOptions) {
        return (
            <Label_>
                {/* <span>{segmentId}</span> */}
                <Select_
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value
                        setFiltersState(fState => {
                            const newState = cloneDeep(fState)
                            newState.filters[seriesIndex].conditions[conditionIndex].value = value
                            return newState
                        })
                    }}
                    value={value}
                >
                    <option value="" disabled>
                        {getString && getString('explorer.select_item')?.t}
                    </option>
                    {groupsOrOptions.map(optionOrGroup => {
                        const { id, label: optionLabel } = optionOrGroup
                        const { key, label } = getValueLabel({
                            getString,
                            field,
                            value: id,
                            allFilters,
                            entity: optionOrGroup?.entity,
                            label: optionLabel
                        })
                        const formattedId = getFormattedOptionValue(id, field)
                        return (
                            <option key={id} value={formattedId} data-key={key}>
                                {label}
                            </option>
                        )
                    })}
                </Select_>
            </Label_>
        )
    } else if (useNumericInput) {
        return (
            <Label_>
                <Input_ onChange={handleChange} value={value} type="number" />
            </Label_>
        )
    } else {
        return (
            <Label_>
                <Input_ onChange={handleChange} value={value} />
            </Label_>
        )
    }
}

type ValueSegmentArrayProps = ValueSegmentProps<FilterValueArray>

const ValueSegmentArray = ({
    seriesIndex,
    conditionIndex,
    stateStuff,
    options,
    value,
    allFilters,
    field
}: ValueSegmentArrayProps) => {
    const { setFiltersState } = stateStuff
    const { getString } = useI18n()
    const groupsOrOptions = field.groups || (field.options as Array<OptionGroup | OptionMetadata>)

    const handleDeleteValue = (valueIndex: number) => {
        setFiltersState(fState => {
            const newState = cloneDeep(fState)
            const currentValueArray = newState.filters[seriesIndex].conditions[conditionIndex]
                .value as FilterValueArray
            currentValueArray.splice(valueIndex, 1)
            return newState
        })
    }

    const handleAddValue = () => {
        setFiltersState(fState => {
            const newState = cloneDeep(fState)
            const currentValue = newState.filters[seriesIndex].conditions[conditionIndex].value

            const newOption = groupsOrOptions.find(
                ({ id }) => !value.includes(getFormattedOptionValue(id, field))
            )

            const newValue = getFormattedOptionValue(newOption?.id, field) as FilterValueString

            console.log('//')
            console.log({ value })
            console.log({ newOption })
            console.log({ newValue })

            newState.filters[seriesIndex].conditions[conditionIndex].value = [
                ...currentValue,
                newValue
            ]

            return newState
        })
    }

    const canDeleteValue = value.length > 1
    const canAddNewValue = groupsOrOptions.length > value.length

    return (
        <Values_>
            {value.map((value, valueIndex) => (
                <Value_ key={value}>
                    <Label_>
                        {/* <span>{segmentId}</span> */}
                        <Select_
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value
                                setFiltersState(fState => {
                                    const newState = cloneDeep(fState)
                                    const currentValueArray = newState.filters[seriesIndex]
                                        .conditions[conditionIndex].value as FilterValueArray
                                    currentValueArray[valueIndex] = value
                                    return newState
                                })
                            }}
                            value={value}
                        >
                            <option value="" disabled>
                                {getString && getString('explorer.select_item')?.t}
                            </option>
                            {groupsOrOptions.map(optionOrGroup => {
                                const { id, entity, label } = optionOrGroup
                                const labelObject = getValueLabel({
                                    getString,
                                    field,
                                    value: id,
                                    allFilters,
                                    entity,
                                    label
                                })
                                const formattedId = getFormattedOptionValue(id, field)
                                return (
                                    <option key={id} value={formattedId} data-key={labelObject.key}>
                                        {labelObject.label}
                                    </option>
                                )
                            })}
                        </Select_>
                    </Label_>

                    {canDeleteValue && (
                        <Button
                            className="value-segment-button value-segment-button-delete"
                            onClick={() => {
                                handleDeleteValue(valueIndex)
                            }}
                        >
                            <DeleteIcon labelId="filters.value.delete" />
                        </Button>
                    )}
                </Value_>
            ))}
            {canAddNewValue && (
                <AddValueWrapper_>
                    <Button
                        className="value-segment-button value-segment-button-add"
                        onClick={handleAddValue}
                    >
                        <PlusIcon labelId="filters.value.add" />
                    </Button>
                </AddValueWrapper_>
            )}
        </Values_>
    )
}

const Values_ = styled.div`
    display: flex;
    gap: var(--halfSpacing);
    flex-direction: column;
`

const Value_ = styled.div`
    display: flex;
    gap: var(--halfSpacing);
    align-items: center;
`

const AddValueWrapper_ = styled.div``
