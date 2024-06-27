import React from 'react'
import { useI18n } from '@devographics/react-i18n'
import cloneDeep from 'lodash/cloneDeep.js'
import { getOperatorLabel } from '../helpers'
import {
    PanelState,
    FilterValue,
    CustomizationDefinition,
    OptionsOperatorEnum,
    NumericOperatorEnum
} from '../types'
import { Label_, Select_ } from './FieldSegment'
import { QuestionMetadata } from '@devographics/types'

type OperatorSegmentProps = {
    seriesIndex: number
    conditionIndex: number
    stateStuff: PanelState
    value: FilterValue
    field: QuestionMetadata
}

export const OperatorSegment = ({
    field,
    seriesIndex,
    conditionIndex,
    stateStuff,
    value
}: OperatorSegmentProps) => {
    const { setFiltersState } = stateStuff
    const { getString } = useI18n()
    const operatorItems = field.optionsAreNumeric
        ? Object.values(NumericOperatorEnum)
        : Object.values(OptionsOperatorEnum)
    return (
        <Label_>
            {/* <span>{segmentId}</span> */}
            <Select_
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const operatorValue = e.target.value as
                        | OptionsOperatorEnum
                        | NumericOperatorEnum
                    setFiltersState((fState: CustomizationDefinition) => {
                        const newState = cloneDeep(fState)
                        newState.filters[seriesIndex].conditions[conditionIndex].operator =
                            operatorValue
                        // if we're changing the operator, also check if we need to change the value
                        const currentValue =
                            newState.filters[seriesIndex].conditions[conditionIndex].value
                        const fieldIsArray = ['in', 'nin'].includes(operatorValue)
                        const valueIsArray = Array.isArray(currentValue)
                        if (fieldIsArray && !valueIsArray) {
                            // we're switching to an array and current value is *not* an array
                            newState.filters[seriesIndex].conditions[conditionIndex].value = [
                                currentValue
                            ]
                        } else if (!fieldIsArray && valueIsArray) {
                            // we're switching to a string and current value *is* an array
                            newState.filters[seriesIndex].conditions[conditionIndex].value =
                                currentValue[0]
                        }
                        return newState
                    })
                }}
                value={value}
            >
                <option value="" disabled>
                    {getString && getString('explorer.select_item')?.t}
                </option>
                {operatorItems.map(operator => (
                    <option key={operator} value={operator}>
                        {getOperatorLabel({ getString, operator })}
                    </option>
                ))}
            </Select_>
        </Label_>
    )
}
