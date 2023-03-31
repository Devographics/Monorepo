import React, { Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'
// import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
import { AxisType, CommonProps } from './types'
import { getSelectorItems } from './helpers'
import { useI18n } from 'core/i18n/i18nContext'
import { getSectionLabel, getGroupLabel, getQuestionLabel } from './labels'
import { Entity } from '@types/index'

interface SelectorProps extends CommonProps {
    axis: AxisType
    // setSection: Dispatch<SetStateAction<string>>;
}

// Selextor either accepts section/setSection props, or use the ones from stateStuff
const Selector = ({ axis, stateStuff, entities }: SelectorProps) => {
    const { getString } = useI18n()

    const selectorItems = getSelectorItems()
    const { setCurrentYear, lastYear } = stateStuff
    const section = stateStuff[`${axis}Section`]
    const setSection = stateStuff[`set${axis}Section`]
    const field = stateStuff[`${axis}Field`]
    const setField = stateStuff[`set${axis}Field`]

    const currentSection = selectorItems.find(s => s.id === section)
    return (
        <Selector_>
            <span>{axis === 'x' ? '→' : '↓'}</span>{' '}
            <select
                onChange={e => {
                    setSection(e.target.value)
                    setField('')
                }}
                value={section}
            >
                {selectorItems.map(({ id }) => (
                    <option key={id} value={id}>
                        {getSectionLabel({ getString, id })}
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
                <option value="" disabled>
                    {getString('explorer.select_item')?.t}
                </option>
                {currentSection?.optGroups.map(({ id, fields }) => (
                    <Group key={id} id={id} fields={fields} section={section} entities={entities} />
                ))}
            </select>
        </Selector_>
    )
}

const Group = ({
    id,
    fields,
    section,
    entities
}: {
    id: string
    fields: string[]
    section: string
    entities: Entity[]
}) => {
    const { getString } = useI18n()

    return (
        <optgroup label={getGroupLabel({ getString, section, id })}>
            {fields.map(f => (
                <option key={f} value={f}>
                    {getQuestionLabel({ getString, sectionId: section, questionId: f, entities })}
                </option>
            ))}
        </optgroup>
    )
}

const Selector_ = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`

export default Selector
