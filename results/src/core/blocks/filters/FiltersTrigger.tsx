import React from 'react'
import ModalTrigger from 'core/components/ModalTrigger'
import { FiltersIcon } from 'core/icons'
import FiltersPanel from './FiltersPanel'

const FiltersTrigger = (props: any) => (
    <ModalTrigger
        trigger={
            <div>
                <FiltersIcon enableTooltip={true} labelId="filters.compare_data" />
            </div>
        }
    >
        <FiltersPanel {...props} />
    </ModalTrigger>
)

export default FiltersTrigger
