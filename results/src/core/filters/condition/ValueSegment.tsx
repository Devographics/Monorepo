import React from 'react'
import { useI18n } from '@devographics/react-i18n'
import cloneDeep from 'lodash/cloneDeep.js'
import { getValueLabel } from '../helpers'
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
import { DeleteIcon, PlusIcon } from 'core/icons'
import { Input_, Label_, Select_ } from './FieldSegment'
import { OptionGroup, OptionMetadata } from '@devographics/types'
import Button from 'core/components/Button'

interface ValueSegmentProps<T> {
    seriesIndex: number
    conditionIndex: number
    stateStuff: PanelState
    options: OptionMetadata[]
    field: FilterItem
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
                        console.log(value)

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
                        const { id, label } = optionOrGroup
                        return (
                            <option key={id} value={id}>
                                {getValueLabel({
                                    getString,
                                    field,
                                    value: id,
                                    allFilters,
                                    entity: optionOrGroup?.entity,
                                    label
                                })}
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
            const newValue = groupsOrOptions.find(({ id }) => !value.includes(id))
                ?.id as FilterValueString
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
                                console.log(value)

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
                            {groupsOrOptions.map(({ id, entity, label }) => (
                                <option key={id} value={id}>
                                    {getValueLabel({
                                        getString,
                                        field,
                                        value: id,
                                        allFilters,
                                        entity,
                                        label
                                    })}
                                </option>
                            ))}
                        </Select_>
                    </Label_>

                    {canDeleteValue && (
                        <DeleteValue_
                            onClick={() => {
                                handleDeleteValue(valueIndex)
                            }}
                        >
                            <DeleteIcon labelId="filters.value.delete" />
                        </DeleteValue_>
                    )}
                </Value_>
            ))}
            {canAddNewValue && (
                <AddValueWrapper_>
                    <AddValue_ onClick={handleAddValue}>
                        <PlusIcon labelId="filters.value.add" />
                    </AddValue_>
                </AddValueWrapper_>
            )}
        </Values_>
    )
}

const Values_ = styled.div`
    display: flex;
    gap: ${spacing(0.5)};
    flex-direction: column;
`

const Value_ = styled.div`
    display: flex;
    gap: ${spacing(0.5)};
    align-items: center;
`

const AddValueWrapper_ = styled.div``

const AddDeleteValue_ = styled(Button)`
    background: none;
    border-color: ${({ theme }) => theme.colors.borderAlt};
    border-radius: 100%;
    aspect-ratio: 1/1;
    display: grid;
    place-items: center;
    height: 24px;
    width: 24px;
    padding: 0;
    .icon-wrapper,
    svg {
        height: 18px;
        width: 18px;
    }
`

const AddValue_ = styled(AddDeleteValue_)``
const DeleteValue_ = styled(AddDeleteValue_)``
