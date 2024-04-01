import React from 'react'
import ModalTrigger from 'core/components/ModalTrigger'
import { FiltersIcon } from 'core/icons'
import FiltersPanel, { FiltersPanelPropsType } from './FiltersPanel'
import { BlockVariantDefinition } from 'core/types'
import { CreateVariantType, UpdateVariantType } from './helpers'

const FiltersTrigger = ({
    block,
    createVariant,
    updateVariant,
    setActiveTab
}: {
    block: BlockVariantDefinition
    createVariant: CreateVariantType
    updateVariant: UpdateVariantType
    setActiveTab: FiltersPanelPropsType['setActiveTab']
}) => {
    return (
        <ModalTrigger
            trigger={
                <div>
                    <FiltersIcon enableTooltip={true} labelId="filters.compare_data" />
                </div>
            }
        >
            <FiltersPanel
                block={block.variants[0]}
                createVariant={createVariant}
                updateVariant={updateVariant}
                setActiveTab={setActiveTab}
            />
        </ModalTrigger>
    )
}

export default FiltersTrigger
