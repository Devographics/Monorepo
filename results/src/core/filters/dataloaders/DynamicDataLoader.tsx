import React, { ReactNode, Dispatch, SetStateAction } from 'react'
import { MODE_FACET, MODE_COMBINED, MODE_GRID, CHART_MODE_DEFAULT } from '../constants'
import { CustomizationDefinition, DataSeries } from '../types'
import { BlockDefinition } from 'core/types/index'
import { BucketUnits, AllQuestionData } from '@devographics/types'
import GridDataLoader from './GridDataLoader'
import CombinedDataLoader from './CombinedDataLoader'
import FacetDataLoader from './FacetDataLoader'

export interface DynamicDataLoaderProps {
    defaultSeries: DataSeries<AllQuestionData>
    block: BlockDefinition
    units: BucketUnits
    setUnits: Dispatch<SetStateAction<BucketUnits>>
    children: ReactNode
    chartFilters: CustomizationDefinition
    layout?: 'grid' | 'column'
    providedSeries?: DataSeries<AllQuestionData> | DataSeries<AllQuestionData>[]
}

const DynamicDataLoader = (props: DynamicDataLoaderProps) => {
    const { chartFilters, children } = props
    const { options = {} } = chartFilters
    const { mode } = options

    switch (mode) {
        case MODE_GRID:
            return <GridDataLoader {...props} />

        case MODE_COMBINED:
            return <CombinedDataLoader {...props} />

        case MODE_FACET:
            return <FacetDataLoader {...props} />

        default:
            return React.cloneElement(children, {
                chartDisplayMode: CHART_MODE_DEFAULT
            })
    }
}

export default DynamicDataLoader
