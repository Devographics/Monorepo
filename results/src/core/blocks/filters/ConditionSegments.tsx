import React from 'react'
import { useI18n } from 'core/i18n/i18nContext'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { DeleteIcon, PlusIcon } from 'core/icons'
import cloneDeep from 'lodash/cloneDeep.js'
import { getFieldLabel, getOperatorLabel, getValueLabel } from './helpers'
import { OPERATORS } from './constants'

export const FieldSegment = ({
    seriesIndex,
    conditionIndex,
    stateStuff,
    options,
    value,
    allChartsOptions,
    field,
    disabledList = []
}) => {
    const { setFiltersState } = stateStuff
    const { getString } = useI18n()
    return (
        <Label_>
            {/* <span>{segmentId}</span> */}
            <Select_
                onChange={e => {
                    const fieldValue = e.target.value
                    setFiltersState(fState => {
                        const newState = cloneDeep(fState)
                        newState.filters[seriesIndex].conditions[conditionIndex].field = fieldValue
                        // if we're changing the field, also change the value
                        const fieldId = fieldValue
                        const currentValue =
                            newState.filters[seriesIndex].conditions[conditionIndex].value
                        const newValue = allChartsOptions?.[fieldId]?.[0]?.id
                        // if current value is an array, make sure new value is an array too
                        newState.filters[seriesIndex].conditions[conditionIndex].value =
                            Array.isArray(currentValue) ? [newValue] : newValue

                        return newState
                    })
                }}
                value={value}
            >
                <option value="" disabled>
                    {getString && getString('explorer.select_item')?.t}
                </option>
                {options.map(o => (
                    <option key={o} value={o} disabled={disabledList.includes(o)}>
                        {getFieldLabel({ getString, field: o })}
                    </option>
                ))}
            </Select_>
        </Label_>
    )
}

export const OperatorSegment = ({ seriesIndex, conditionIndex, stateStuff, value }) => {
    const { setFiltersState } = stateStuff
    const { getString } = useI18n()
    return (
        <Label_>
            {/* <span>{segmentId}</span> */}
            <Select_
                onChange={e => {
                    const operatorValue = e.target.value
                    setFiltersState(fState => {
                        const newState = cloneDeep(fState)
                        newState.filters[seriesIndex].conditions[conditionIndex].operator =
                            operatorValue
                        // if we're changing the operator, also check if we need to change the value
                        const currentValue =
                            newState.filters[seriesIndex].conditions[conditionIndex].value
                        const fieldIsArray = ['in', 'nin'].includes(operatorValue)
                        const valueIsArray = Array.isArray(currentValue)
                        if (fieldIsArray && !valueIsArray) {
                            // we're switching to an array and current value is *not* an array
                            newState.filters[seriesIndex].conditions[conditionIndex].value = [
                                currentValue
                            ]
                        } else if (!fieldIsArray && valueIsArray) {
                            // we're switching to a string and current value *is* an array
                            newState.filters[seriesIndex].conditions[conditionIndex].value =
                                currentValue[0]
                        }
                        return newState
                    })
                }}
                value={value}
            >
                <option value="" disabled>
                    {getString && getString('explorer.select_item')?.t}
                </option>
                {OPERATORS.map(operator => (
                    <option key={operator} value={operator}>
                        {getOperatorLabel({ getString, operator })}
                    </option>
                ))}
            </Select_>
        </Label_>
    )
}

export const ValueSegment = props => {
    const isArray = ['in', 'nin'].includes(props.operator)
    return isArray ? <ValueSegmentArray {...props} /> : <ValueSegmentField {...props} />
}

const ValueSegmentField = ({
    seriesIndex,
    conditionIndex,
    stateStuff,
    options,
    value,
    field,
    allChartsOptions,
    operator
}) => {
    const { setFiltersState } = stateStuff
    const { getString } = useI18n()

    return (
        <Label_>
            {/* <span>{segmentId}</span> */}
            <Select_
                onChange={e => {
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
                {options.map(({ id, entity, label }) => (
                    <option key={id} value={id}>
                        {getValueLabel({ getString, field, value: id, allChartsOptions })}
                    </option>
                ))}
            </Select_>
        </Label_>
    )
}

const ValueSegmentArray = ({
    seriesIndex,
    conditionIndex,
    stateStuff,
    options,
    value,
    field,
    allChartsOptions
}) => {
    const { setFiltersState } = stateStuff
    const { getString } = useI18n()

    const canAddNewValue = options.length > value.length

    const handleDeleteValue = valueIndex => {
        setFiltersState(fState => {
            const newState = cloneDeep(fState)
            newState.filters[seriesIndex].conditions[conditionIndex].value.splice(valueIndex, 1)
            return newState
        })
    }

    const handleAddValue = () => {
        setFiltersState(fState => {
            const newState = cloneDeep(fState)
            const currentValue = newState.filters[seriesIndex].conditions[conditionIndex].value
            const newValue = options.find(({ id }) => !value.includes(id))?.id
            newState.filters[seriesIndex].conditions[conditionIndex].value = [
                ...currentValue,
                newValue
            ]
            return newState
        })
    }

    return (
        <Values_>
            {value.map((value, valueIndex) => (
                <Value_ key={value}>
                    <Label_>
                        {/* <span>{segmentId}</span> */}
                        <Select_
                            onChange={e => {
                                const value = e.target.value
                                setFiltersState(fState => {
                                    const newState = cloneDeep(fState)
                                    newState.filters[seriesIndex].conditions[conditionIndex].value[
                                        valueIndex
                                    ] = value
                                    return newState
                                })
                            }}
                            value={value}
                        >
                            <option value="" disabled>
                                {getString && getString('explorer.select_item')?.t}
                            </option>
                            {options.map(({ id, entity, label }) => (
                                <option key={id} value={id}>
                                    {getValueLabel({
                                        getString,
                                        field,
                                        value: id,
                                        allChartsOptions
                                    })}
                                </option>
                            ))}
                        </Select_>
                    </Label_>

                    <DeleteValue_
                        onClick={() => {
                            handleDeleteValue(valueIndex)
                        }}
                    >
                        <DeleteIcon labelId="filters.value.delete" />
                    </DeleteValue_>
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

export const Condition_ = styled.div`
    background: ${({ theme }) => theme.colors.backgroundTrans};
    border-radius: 10px;
    position: relative;
`

const Label_ = styled.label`
    display: block;
    width: 100%;
`

const Select_ = styled.select`
    max-width: 300px;
    width: 100%;
`

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
