import React from 'react'
import styled from 'styled-components'
// import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
import { AxisType } from './types'
import { getSelectorItems } from './helpers'

const Selector = ({ axis, stateStuff }: { axis: AxisType; stateStuff: any }) => {
    const selectorItems = getSelectorItems()
    const section = stateStuff[`${axis}Section`]
    const setSection = stateStuff[`set${axis}Section`]
    const field = stateStuff[`${axis}Field`]
    const setField = stateStuff[`set${axis}Field`]

    const currentSection = selectorItems.find(s => s.id === section)
    return (
        <Selector_>
            <span>{axis === 'x' ? '→' : '↑'}</span>
            {' '}
            <select
                onChange={e => {
                    setSection(e.target.value)
                }}
            >
                {selectorItems.map(({ id }) => (
                    <option key={id} value={id} selected={id === section}>
                        {id}
                    </option>
                ))}
            </select>
            <select
                onChange={e => {
                    setField(e.target.value)
                }}
            >
                {currentSection?.optGroups.map(({ id, fields }) => (
                    <Group key={id} id={id} fields={fields} field={field} />
                ))}
            </select>
        </Selector_>
    )
}

const Group = ({ id, fields, field }: { id: string; fields: string[]; field: string }) => (
    <optgroup label={id}>
        {fields.map(f => (
            <option key={f} value={f} selected={f === field}>
                {f}
            </option>
        ))}
    </optgroup>
)

const Selector_ = styled.div``

export default Selector
