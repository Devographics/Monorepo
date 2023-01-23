import React from 'react'
import { useI18n } from 'core/i18n/i18nContext'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { DeleteIcon, TrashIcon, PlusIcon } from 'core/icons'
import cloneDeep from 'lodash/cloneDeep.js'
import { getFieldLabel, getOperatorLabel, getValueLabel } from './helpers'
import { useAllChartsOptions } from 'core/charts/hooks'
import { OPERATORS } from './constants'

const Condition = ({
    seriesIndex,
    index,
    filters,
    filtersInUse,
    filtersNotInUse,
    condition,
    stateStuff
}) => {
    const defaultField = filtersNotInUse[0]
    const { field = defaultField, operator, value } = condition
    const { setFiltersState } = stateStuff

    const allChartsOptions = useAllChartsOptions()

    const values = allChartsOptions[field] || []

    const disabledList = filtersInUse.filter(fieldId => fieldId !== field)

    const handleDelete = () => {
        setFiltersState(fState => {
            const newState = cloneDeep(fState)
            newState.filters[seriesIndex].conditions.splice(index, 1)
            return newState
        })
    }

    const segmentProps = { seriesIndex, conditionIndex: index, stateStuff, allChartsOptions, field }

    return (
        <ActiveCondition_>
            <Segments_>
                <FieldSegment
                    {...segmentProps}
                    options={filters}
                    value={field}
                    disabledList={disabledList}
                />
                <OperatorSegment {...segmentProps} value={operator} />
                {/* <Operator_>=</Operator_> */}
                {/* TODO: support arrays with `in` and `nin`, for now only use `=` */}
                {/* <ConditionSegment
                    {...segmentProps}
                    segmentId={'operator'}
                    options={operators}
                    value={operator}
                /> */}
                <ValueSegment
                    {...segmentProps}
                    operator={operator}
                    options={values}
                    value={value}
                />
            </Segments_>
            <DeleteCondition_ onClick={handleDelete}>
                <DeleteIcon labelId="filters.condition.delete" />
            </DeleteCondition_>
            <And_>
                {/* <T k="filters.condition.and" /> */}
                <PlusIcon />
            </And_>
        </ActiveCondition_>
    )
}

const FieldSegment = ({
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
                        newState.filters[seriesIndex].conditions[conditionIndex].value =
                            allChartsOptions?.[fieldId]?.[0]?.id
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

const OperatorSegment = ({ seriesIndex, conditionIndex, stateStuff, value }) => {
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

const ValueSegment = props => {
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
    allChartsOptions,
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
    padding: ${spacing()};
    border-radius: 10px;
    position: relative;
`

const ActiveCondition_ = styled(Condition_)`
    display: flex;
    /* grid-template-columns: auto minmax(0, 1fr); */
    gap: ${spacing()};
    justify-content: space-between;
    align-items: center;
`

const DeleteCondition_ = styled(Button)`
    background: none;
    border-color: ${({ theme }) => theme.colors.borderAlt};
    /* border: 0; */
    border-radius: 100%;
    aspect-ratio: 1/1;
    padding: 6px;
    /* position: absolute;
    top: 0px;
    right: 0px;
    transform: translateX(50%) translateY(50%); */
`

const And_ = styled.div`
    position: absolute;
    bottom: 0px;
    left: 50%;
    transform: translateX(-50%) translateY(50%);
    background: ${({ theme }) => theme.colors.backgroundAlt};
    padding: 6px;
    border-radius: 100%;
    text-transform: uppercase;
    z-index: 100;
    ${Condition_}:last-child & {
        display: none;
    }
`

const Actions_ = styled.div`
    display: grid;
    place-items: center;
`

const Operator_ = styled.div``

const Segments_ = styled.div`
    display: flex;
    gap: ${spacing()};
    @media ${mq.smallMedium} {
        flex-direction: column;
        align-items: center;
        gap: ${spacing(0.5)};
    }
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
    gap: ${spacing()};
    flex-direction: column;
`

const Value_ = styled.div`
    display: flex;
    gap: ${spacing(0.5)};
    align-items: center;
`

const AddValueWrapper_ = styled.div``

const AddValue_ = styled(Button)`
    background: none;
    border-color: ${({ theme }) => theme.colors.borderAlt};
    border-radius: 100%;
    aspect-ratio: 1/1;
    padding: 6px;
`

const DeleteValue_ = styled(Button)`
    background: none;
    border-color: ${({ theme }) => theme.colors.borderAlt};
    border-radius: 100%;
    aspect-ratio: 1/1;
    padding: 2px;
    height: 24px;
    width: 24px;
    .icon-wrapper, svg {
    height: 18px;
    width: 18px;

    }
`

export default Condition
