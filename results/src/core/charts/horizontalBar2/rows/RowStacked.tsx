import React from 'react'
import { RowWrapper } from './RowWrapper'
import { Cell } from '../HorizontalBarCell'
import { RowComponentProps } from '../types'
import { useColorScale, useGradient } from '../../common2/helpers/colors'
import { RespondentCount } from '../../common2'
import { Bucket } from '@devographics/types'
import { getBlockAllFacetBucketIds, getBucketsAllFacetBucketIds } from '../helpers/other'
import { AnswersCount } from 'core/charts/common2/AnswersCount'

export const RowStacked = (props: RowComponentProps) => {
    const {
        bucket,
        buckets,
        chartState,
        chartValues,
        rowIndex,
        allRowsCellDimensions,
        allRowsOffsets,
        viewDefinition
    } = props
    // assume this is a root bucket and not a facet bucket
    const bucket_ = bucket as Bucket
    const { facetQuestion } = chartValues
    const { facetBuckets } = bucket_

    // if (!facetQuestion) {
    //     throw new Error(`facetQuestion not defined in RowStacked`)
    // }
    if (!allRowsCellDimensions || !allRowsOffsets) {
        throw new Error('Missing allRowsCellDimensions or allRowsOffsets')
    }

    const rowDimensions = allRowsCellDimensions[rowIndex]
    const rowOffset = allRowsOffsets[rowIndex]

    const allFacetBucketIds = getBucketsAllFacetBucketIds(buckets)
    const colorScale = useColorScale({ question: facetQuestion, bucketIds: allFacetBucketIds })

    return (
        <RowWrapper {...props} rowMetadata={<AnswersCount count={bucket.count} />}>
            <div className="chart-faceted-bar">
                {facetBuckets.map((facetBucket, index) => {
                    const { id } = facetBucket
                    const { width, offset } = rowDimensions[index]
                    const gradient = useGradient({
                        id: facetBucket.id,
                        question: facetQuestion,
                        colorScale
                    })
                    return (
                        <Cell
                            key={id}
                            bucket={facetBucket}
                            chartState={chartState}
                            width={width}
                            offset={offset - rowOffset}
                            cellIndex={index}
                            chartValues={chartValues}
                            gradient={gradient}
                            viewDefinition={viewDefinition}
                            parentTotal={bucket.count || 0}
                        />
                    )
                })}
            </div>
        </RowWrapper>
    )
}
