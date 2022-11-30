import React from 'react'
import styled from 'styled-components'
// import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
import { AxisType } from './types'
import { getSelectorItems } from './helpers'
import { useI18n } from 'core/i18n/i18nContext'
import { Entity } from 'core/types'

const Selector = ({
    axis,
    stateStuff,
    entities
}: {
    axis: AxisType
    stateStuff: any
    entities: Entity[]
}) => {
    const { getString } = useI18n()

    const selectorItems = getSelectorItems()
    const { setCurrentYear, lastYear } = stateStuff
    const section = stateStuff[`${axis}Section`]
    const setSection = stateStuff[`set${axis}Section`]
    const field = stateStuff[`${axis}Field`]
    const setField = stateStuff[`set${axis}Field`]

    const getSectionLabel = (id: string) => {
        const s = getString(`explorer.sections.${id}`)
        return s.t
    }

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
                        {getSectionLabel(id)}
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

    const getGroupLabel = (section, id) => {
        const key = id === 'explorer.all_fields' ? '' : `sections.${id}.title`
        return getString(key)?.t
    }

    const getQuestionLabel = (section, id) => {
        const entity = entities.find(e => e.id === id)
        if (entity) {
            return entity.nameClean || entity.name
        } else {
            const sectionSegment = section === 'demographics' ? 'user_info' : section
            const key = `${sectionSegment}.${id}`
            const s = getString(key)
            return s.t
        }
    }
    return (
        <optgroup label={getGroupLabel(section, id)}>
            {fields.map(f => (
                <option key={f} value={f}>
                    {getQuestionLabel(section, f)}
                </option>
            ))}
        </optgroup>
    )
}

const Selector_ = styled.div``

export default Selector
