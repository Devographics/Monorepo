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
    field: FilterItem
    allFilters: FilterItem[]
    disabledList: string[]
}
export const FieldSegment = ({
    seriesIndex,
    conditionIndex,
    stateStuff,
    field,
    allFilters,
    disabledList = []
}: FieldSegmentProps) => {
    const { setFiltersState } = stateStuff

    return (
        <Label_>
            {/* <span>{segmentId}</span> */}
            <Select_
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const fieldId = e.target.value
                    const sectionId = allFilters.find(f => f.id === fieldId)?.sectionId as string
                    setFiltersState((fState: CustomizationDefinition) => {
                        const newState = cloneDeep(fState)
                        const condition = newState.filters[seriesIndex].conditions[conditionIndex]
                        condition.fieldId = fieldId
                        condition.sectionId = sectionId
                        // if we're changing the field, also change the value
                        const newValue = allFilters.find(f => f.id === fieldId)?.options[0].id
                        if (newValue) {
                            // if current value is an array, make sure new value is an array too
                            condition.value = Array.isArray(condition.value) ? [newValue] : newValue
                        }
                        return newState
                    })
                }}
                value={field.id}
            >
                <ItemSelectOptions allFilters={allFilters} disabledList={disabledList} />
            </Select_>
        </Label_>
    )
}

type ItemSelectOptionsProps = {
    allFilters: FilterItem[]
    disabledList?: string[]
}

export const ItemSelectOptions = ({ allFilters, disabledList }: ItemSelectOptionsProps) => {
    const entities = useEntities()
    const { getString } = useI18n()
    const { currentEdition } = usePageContext()
    const { sections } = currentEdition
    const demographicsSection = sections.find(s => s.id === 'user_info')
    const otherSections = sections.filter(s => s.id !== 'user_info')
    const orderedSections = demographicsSection
        ? [demographicsSection, ...otherSections]
        : otherSections

    return (
        <>
            <option value="" disabled>
                {getString && getString('explorer.select_item')?.t}
            </option>
            {orderedSections.map(section => {
                const sectionItems = allFilters.filter(o => o.sectionId === section.id)
                return sectionItems.length > 0 ? (
                    <optgroup key={section.id} label={getSectionLabel({ getString, section })}>
                        {sectionItems.map((o: FilterItem) => (
                            <option key={o.id} value={o.id} disabled={disabledList?.includes(o.id)}>
                                {getFieldLabel({ getString, field: o, entities })}
                            </option>
                        ))}
                    </optgroup>
                ) : null
            })}
        </>
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
