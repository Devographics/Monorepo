import React from 'react'
import styled from 'styled-components'
// import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
import { AxisType, CommonProps } from './types'
import { useI18n } from 'core/i18n/i18nContext'
import { SectionMetadata } from '@devographics/types'
import { usePageContext } from 'core/helpers/pageContext'
import { getSectionLabel, getOrderedSections, getFieldLabel } from 'core/filters/helpers'
import { useAllFilters } from 'core/charts/hooks'

interface SelectorProps extends CommonProps {
    axis: AxisType
    // setSection: Dispatch<SetStateAction<string>>;
}

// Selextor either accepts section/setSection props, or use the ones from stateStuff
const Selector = ({ axis, stateStuff, entities }: SelectorProps) => {
    const { getString } = useI18n()
    const allFilters = useAllFilters()

    const { currentEdition } = usePageContext()
    const { sections } = currentEdition
    const { setCurrentYear, lastYear } = stateStuff
    const section = stateStuff[`${axis}Section`]
    const setSection = stateStuff[`set${axis}Section`]
    const field = stateStuff[`${axis}Field`]
    const setField = stateStuff[`set${axis}Field`]

    const getSectionFilters = (section: SectionMetadata) =>
        allFilters.filter(o => o.sectionId === section?.id)

    const currentSection = sections.find(s => s.id === section) as SectionMetadata

    const orderedSections = getOrderedSections(currentEdition.sections).filter(
        s => getSectionFilters(s).length > 0
    )

    const sectionItems = getSectionFilters(currentSection)
    return (
        <Selector_>
            <span>{axis === 'x' ? '→' : '↓'}</span>{' '}
            <select
                onChange={e => {
                    const selectedSectionId = e.target.value
                    setSection(selectedSectionId)
                    const selectedSection = sections.find(
                        s => s.id == selectedSectionId
                    ) as SectionMetadata
                    const selectedSectionItems = getSectionFilters(selectedSection)
                    setField(selectedSectionItems[0].id)
                }}
                value={section}
            >
                {orderedSections.map(section => (
                    <option key={section.id} value={section.id}>
                        {getSectionLabel({ getString, section })}
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
                {/* <option value="" disabled>
                    {getString('explorer.select_item')?.t}
                </option> */}
                {sectionItems.map(field => (
                    <option key={field.id} value={field.id}>
                        {getFieldLabel({
                            getString,
                            field,
                            entities
                        })}
                    </option>
                ))}
            </select>
        </Selector_>
    )
}

// const Group = ({
//     id,
//     fields,
//     section,
//     entities
// }: {
//     id: string
//     fields: string[]
//     section: string
//     entities: Entity[]
// }) => {
//     const { getString } = useI18n()

//     return (
//         <optgroup label={getGroupLabel({ getString, section, id })}>
//             {fields.map(f => (
//                 <option key={f} value={f}>
//                     {getQuestionLabel({ getString, sectionId: section, questionId: f, entities })}
//                 </option>
//             ))}
//         </optgroup>
//     )
// }

const Selector_ = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`

export default Selector
