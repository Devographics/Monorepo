import React from 'react'
import styled from 'styled-components'
// import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
import { AxisType } from './types'
import { getSelectorItems } from './helpers'

const Selector = ({ axis, stateStuff }: { axis: AxisType; stateStuff: any }) => {
    const selectorItems = getSelectorItems()
    const { setCurrentYear, lastYear } = stateStuff
    const section = stateStuff[`${axis}Section`]
    const setSection = stateStuff[`set${axis}Section`]
    const field = stateStuff[`${axis}Field`]
    const setField = stateStuff[`set${axis}Field`]

    const currentSection = selectorItems.find(s => s.id === section)
    return (
        <Selector_>
            <span>{axis === 'x' ? '→' : '↑'}</span>{' '}
            <select
                onChange={e => {
                    setSection(e.target.value)
                    setField('')
                }}
                value={section}
            >
                {selectorItems.map(({ id }) => (
                    <option key={id} value={id}>
                        {id}
                    </option>
                ))}
            </select>
            <select
                onChange={e => {
                    setField(e.target.value)
                    setCurrentYear(lastYear)
                }}
                value={field}
            >
                <option value="" disabled>Select item</option>
                {currentSection?.optGroups.map(({ id, fields }) => (
                    <Group key={id} id={id} fields={fields} />
                ))}
            </select>
        </Selector_>
    )
}

const Group = ({ id, fields }: { id: string; fields: string[] }) => (
    <optgroup label={id}>
        {fields.map(f => (
            <option key={f} value={f}>
                {f}
            </option>
        ))}
    </optgroup>
)

const Selector_ = styled.div``

export default Selector
