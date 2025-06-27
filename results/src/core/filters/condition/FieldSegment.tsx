import React from 'react'
import { useI18n } from '@devographics/react-i18n'
import styled from 'styled-components'
import cloneDeep from 'lodash/cloneDeep.js'
import { getFieldLabel, getOrderedSections, getSectionLabel } from '../helpers'
import { usePageContext } from 'core/helpers/pageContext'
import { useEntities } from 'core/helpers/entities'
import { PanelState, FilterItem, CustomizationDefinition } from '../types'
import { BlockVariantDefinition } from 'core/types'

interface FieldSegmentProps {
    seriesIndex: number
    block: BlockVariantDefinition
    conditionIndex: number
    stateStuff: PanelState
    field: FilterItem
    allFilters: FilterItem[]
    disabledList: string[]
}
export const FieldSegment = ({
    seriesIndex,
    block,
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
                        const field = allFilters.find(f => f.id === fieldId)
                        const optionsOrGroups = field?.groups || field?.options || []
                        const newValue = optionsOrGroups[0]?.id
                        if (newValue) {
                            // if current value is an array, make sure new value is an array too
                            condition.value = Array.isArray(condition.value) ? [newValue] : newValue
                        } else {
                            condition.value = null
                        }
                        return newState
                    })
                }}
                value={field.id}
            >
                <ItemSelectOptions
                    allFilters={allFilters}
                    currentQuestionId={block.fieldId || block.id}
                    disabledList={disabledList}
                />
            </Select_>
        </Label_>
    )
}

type ItemSelectOptionsProps = {
    allFilters: FilterItem[]
    currentQuestionId: string
    disabledList?: string[]
}

// TODO: do this better to avoid hardcoding this list here
const disallowedQuestions = [
    'referrer',
    'sourcetag',
    'future_surveys',
    'future_editions',
    'future_same_survey_count'
]

export const ItemSelectOptions = ({
    allFilters,
    currentQuestionId,
    disabledList = []
}: ItemSelectOptionsProps) => {
    const entities = useEntities()
    const { getString } = useI18n()
    const { currentEdition } = usePageContext()
    const { sections } = currentEdition
    const orderedSections = getOrderedSections(sections)

    return (
        <>
            <option value="" disabled>
                {getString && getString('explorer.select_item')?.t}
            </option>
            {orderedSections.map(section => {
                const sectionItems = allFilters
                    .filter(q => q.sectionId === section.id)
                    .filter(q => !disallowedQuestions.includes(q.id))
                return sectionItems.length > 0 ? (
                    <optgroup key={section.id} label={getSectionLabel({ getString, section })}>
                        {sectionItems.map((question: FilterItem) => {
                            const { label, key } = getFieldLabel({
                                getString,
                                field: question,
                                entities
                            })
                            return (
                                <option
                                    key={question.id}
                                    value={question.id}
                                    data-key={key}
                                    disabled={[...disabledList]?.includes(question.id)}
                                >
                                    {label}
                                </option>
                            )
                        })}
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
    padding: 4px 2px;
`

export const Input_ = styled.input`
    max-width: 300px;
    width: 100%;
`
