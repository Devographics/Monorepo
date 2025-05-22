import React from 'react'
import { useI18n } from '@devographics/react-i18n'
import Toggle, { DEFAULT_SORT, ToggleItemType, ToggleValueType } from '../Toggle'
import { OrderOptions } from '../types'
import { FreeformAnswersState } from '../freeform_answers/types'
import { ALPHA, LENGTH } from './constants'

export const OrderToggle = ({
    sort,
    setSort,
    order,
    setOrder
}: {
    sort: FreeformAnswersState['sort']
    setSort: FreeformAnswersState['setSort']
    order: FreeformAnswersState['order']
    setOrder: FreeformAnswersState['setOrder']
}) => {
    const { getString } = useI18n()

    const labelKey1 = 'answers.alphabetical'
    const labelKey2 = 'answers.length'
    const toggleItems: ToggleItemType[] = [
        {
            id: ALPHA,
            label: getString(labelKey1)?.t,
            labelKey: labelKey1,
            isEnabled: sort === ALPHA
        },
        {
            id: LENGTH,
            label: getString(labelKey2)?.t,
            labelKey: labelKey2,
            isEnabled: sort === LENGTH
        }
    ]

    const handleSelect = (optionId: ToggleValueType | null) => {
        const isEnabled = sort === optionId
        if (optionId === DEFAULT_SORT) {
            setSort(null)
            setOrder(null)
        } else if (!isEnabled) {
            setSort(optionId as string)
            setOrder(OrderOptions.ASC)
        } else if (sort && order === OrderOptions.ASC) {
            setOrder(OrderOptions.DESC)
        } else {
            setSort(null)
            setOrder(null)
        }
    }

    return (
        <Toggle
            sortId={sort}
            sortOrder={order}
            labelId="charts.sort_by"
            handleSelect={handleSelect}
            items={toggleItems}
            hasDefault={true}
        />
    )
}
