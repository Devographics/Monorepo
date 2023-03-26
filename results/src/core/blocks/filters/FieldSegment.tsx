import React from 'react'
import { useI18n } from 'core/i18n/i18nContext'
import styled from 'styled-components'
import cloneDeep from 'lodash/cloneDeep.js'
import { getFieldLabel, getSectionLabel } from './helpers'
import { usePageContext } from 'core/helpers/pageContext'
import { useEntities } from 'core/helpers/entities'
import { PanelState, FilterItem, CustomizationDefinition } from './types'

interface FieldSegmentProps {
    seriesIndex: number
    conditionIndex: number
    stateStuff: PanelState
    fieldId: string
    allFilters: FilterItem[]
    disabledList: any
}
export const FieldSegment = ({
    seriesIndex,
    conditionIndex,
    stateStuff,
    fieldId,
    allFilters,
    disabledList = []
}: FieldSegmentProps) => {
    const entities = useEntities()
    const { setFiltersState } = stateStuff
    const { getString } = useI18n()
    const { currentEdition } = usePageContext()
    const { sections } = currentEdition
    const demographicsSection = sections.find(s => s.id === 'user_info')
    const otherSections = sections.filter(s => s.id !== 'user_info')
    const orderedSections = demographicsSection
        ? [demographicsSection, ...otherSections]
        : otherSections
    return (
        <Label_>
            {/* <span>{segmentId}</span> */}
            <Select_
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const fieldValue = e.target.value
                    console.log('//onChange')
                    console.log(fieldValue)
                    setFiltersState((fState: CustomizationDefinition) => {
                        const newState = cloneDeep(fState)
                        newState.filters[seriesIndex].conditions[conditionIndex].fieldId =
                            fieldValue
                        // if we're changing the field, also change the value
                        const fieldId = fieldValue
                        const currentValue =
                            newState.filters[seriesIndex].conditions[conditionIndex].value
                        const newValue = allFilters.find(f => f.id === fieldId)?.options[0].id
                        if (newValue) {
                            // if current value is an array, make sure new value is an array too
                            newState.filters[seriesIndex].conditions[conditionIndex].value =
                                Array.isArray(currentValue) ? [newValue] : newValue
                        }
                        console.log(newValue)
                        console.log(newState)

                        return newState
                    })
                }}
                value={fieldId}
            >
                <option value="" disabled>
                    {getString && getString('explorer.select_item')?.t}
                </option>
                {orderedSections.map(section => {
                    const sectionItems = allFilters.filter(o => o.sectionId === section.id)
                    return sectionItems.length > 0 ? (
                        <optgroup key={section.id} label={getSectionLabel({ getString, section })}>
                            {sectionItems.map((o: FilterItem) => (
                                <option key={o.id} value={o.id} disabled={disabledList.includes(o)}>
                                    {getFieldLabel({ getString, field: o, entities })}
                                </option>
                            ))}
                        </optgroup>
                    ) : null
                })}
            </Select_>
        </Label_>
    )
}

export const Condition_ = styled.div`
    background: ${({ theme }) => theme.colors.backgroundTrans};
    border-radius: 10px;
    position: relative;
`

export const Label_ = styled.label`
    display: block;
    width: 100%;
`

export const Select_ = styled.select`
    max-width: 300px;
    width: 100%;
`
