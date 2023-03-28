import React, { ReactNode, Dispatch, SetStateAction } from 'react'
import { getFiltersQuery } from './helpers'
// import { spacing, mq, fontSize } from 'core/theme'
import { MODE_FACET, MODE_COMBINED, MODE_GRID, CHART_MODE_DEFAULT } from './constants'
import { CustomizationDefinition } from './types'
import { BlockDefinition, PageContextValue } from '@types/index'
import get from 'lodash/get'
import { getBlockDataPath } from 'core/helpers/data'
import { QueryData, AllQuestionData, BucketUnits } from '@devographics/types'
import GridDataLoader from './GridDataLoader'
import CombinedDataLoader from './CombinedDataLoader'
import FacetDataLoader from './FacetDataLoader'

// const getSeriesData = ({ result, path }: { result: any; path: string }) => {
//     // example paths: "dataAPI.survey.demographics.yearly_salary1.year" or "dataAPI.survey.podcasts2.year"
//     const pathSegments = path.split('.')
//     const [apiSegment, surveySegment, sectionSegment, ...rest] = pathSegments
//     if (path.includes('demographics')) {
//         // result object of type survey.demographics.age_1
//         return result[surveySegment][sectionSegment]
//     } else {
//         // result object of type survey.first_steps_1
//         return result[surveySegment]
//     }
// }

/*

Take a series and get the buckets from its first facet

*/
// const getSeriesItemBuckets = seriesItem => seriesItem?.year?.facets[0]?.buckets

export type DynamicDataLoaderProps = {
    block: BlockDefinition
    data: any
    getChartData: any
    processBlockDataOptions: any
    setUnits: Dispatch<SetStateAction<BucketUnits>>
    completion: any
    children: ReactNode
    chartFilters: CustomizationDefinition
    setBuckets: Dispatch<SetStateAction<any>>
    layout: 'grid' | 'column'
    combineSeries: Function
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
