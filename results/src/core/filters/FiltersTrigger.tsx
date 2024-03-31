import React from 'react'
import ModalTrigger from 'core/components/ModalTrigger'
import { FiltersIcon } from 'core/icons'
import FiltersPanel, { FiltersPanelPropsType } from './FiltersPanel'
import { BlockDefinition } from 'core/types'
import { AddVariantType, UpdateVariantType } from './helpers'

const FiltersTrigger = ({
    block,
    addVariant,
    updateVariant
}: {
    block: BlockDefinition
    addVariant: AddVariantType
    updateVariant: UpdateVariantType
}) => {
    return (
        <ModalTrigger
            trigger={
                <div>
                    <FiltersIcon enableTooltip={true} labelId="filters.compare_data" />
                </div>
            }
        >
            <FiltersPanel block={block} addVariant={addVariant} updateVariant={updateVariant} />
        </ModalTrigger>
    )
}

export default FiltersTrigger
