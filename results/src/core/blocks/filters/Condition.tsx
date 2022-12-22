import React from 'react'
import { useI18n } from 'core/i18n/i18nContext'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { DeleteIcon, TrashIcon, PlusIcon } from 'core/icons'
import cloneDeep from 'lodash/cloneDeep.js'
import { useKeys, getFieldLabel, getValueLabel } from './helpers'

const operators = ['eq', 'in', 'nin']

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

    const { getString } = useI18n()

    const keys = useKeys()

    const values = keys[field] || []

    const disabledList = filtersInUse.filter(fieldId => fieldId !== field)

    const handleDelete = () => {
        setFiltersState(fState => {
            const newState = cloneDeep(fState)
            newState[seriesIndex].conditions.splice(index, 1)
            return newState
        })
    }

    const segmentProps = { seriesIndex, conditionIndex: index, stateStuff, keys, field }

    return (
        <ActiveCondition_>
            <Segments_>
                <FieldSegment
                    {...segmentProps}
                    segmentId={'field'}
                    options={filters}
                    value={field}
                    disabledList={disabledList}
                />
                <Operator_>=</Operator_>
                {/* TODO: support arrays with `in` and `nin`, for now only use `=` */}
                {/* <ConditionSegment
                    {...segmentProps}
                    segmentId={'operator'}
                    options={operators}
                    value={operator}
                /> */}
                <ValueSegment
                    {...segmentProps}
                    segmentId={'value'}
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
    segmentId,
    options,
    value,
    keys,
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
                    const value = e.target.value
                    setFiltersState(fState => {
                        const newState = cloneDeep(fState)
                        newState[seriesIndex].conditions[conditionIndex][segmentId] = value
                        // if we're changing the field, also change the value
                        const fieldId = value
                        newState[seriesIndex].conditions[conditionIndex].value = keys[fieldId][0]
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

const ValueSegment = ({
    seriesIndex,
    conditionIndex,
    stateStuff,
    segmentId,
    options,
    value,
    keys,
    field
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
                        newState[seriesIndex].conditions[conditionIndex][segmentId] = value
                        return newState
                    })
                }}
                value={value}
            >
                <option value="" disabled>
                    {getString && getString('explorer.select_item')?.t}
                </option>
                {options.map(o => (
                    <option key={o} value={o}>
                        {getValueLabel({ getString, field, value: o })}
                    </option>
                ))}
            </Select_>
        </Label_>
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

export default Condition
