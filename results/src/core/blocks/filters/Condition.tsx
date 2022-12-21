import React from 'react'
import { useI18n } from 'core/i18n/i18nContext'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { TrashIcon, PlusIcon } from 'core/icons'
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
        <Condition_>
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
            <Button size="small" onClick={handleDelete}>
                <TrashIcon labelId="filters.condition.delete" />
            </Button>
            <And_>
                {/* <T k="filters.condition.and" /> */}
                <PlusIcon />
            </And_>
        </Condition_>
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
            <select
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
            </select>
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
            <select
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
            </select>
        </Label_>
    )
}

const Condition_ = styled.div`
    display: flex;
    justify-content: space-between;
    background: ${({ theme }) => theme.colors.backgroundTrans};
    padding: ${spacing()};
    border-radius: 3px;
    position: relative;
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

const Operator_ = styled.div``

const Segments_ = styled.div`
    display: flex;
    gap: ${spacing()};
`

const Label_ = styled.label`
    display: flex;
    gap: ${spacing(0.5)};
`

export default Condition
