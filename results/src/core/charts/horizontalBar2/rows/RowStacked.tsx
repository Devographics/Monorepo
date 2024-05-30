import React from 'react'
import { RowWrapper } from './RowWrapper'
import { Cell } from '../HorizontalBarCell'
import { RowComponentProps } from '../types'
import { useGradient } from '../helpers/colors'
import { RespondentCount } from '../../common2'
import { Bucket } from '@devographics/types'

export const RowStacked = (props: RowComponentProps) => {
    const { bucket, chartState, chartValues, rowIndex, allRowsCellDimensions, allRowsOffsets } =
        props
    // assume this is a root bucket and not a facet bucket
    const bucket_ = bucket as Bucket
    const { facetQuestion } = chartValues
    const { facetBuckets } = bucket_

    if (!allRowsCellDimensions || !allRowsOffsets) {
        throw new Error('Missing allRowsCellDimensions or allRowsOffsets')
    }

    const rowDimensions = allRowsCellDimensions[rowIndex]
    const rowOffset = allRowsOffsets[rowIndex]

    return (
        <RowWrapper {...props} rowMetadata={<RespondentCount count={bucket.count} />}>
            <div className="chart-faceted-bar">
                {facetBuckets.map((facetBucket, index) => {
                    const { id } = facetBucket
                    const { width, offset } = rowDimensions[index]
                    const gradient = useGradient({ id: facetBucket.id, question: facetQuestion })
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
                        />
                    )
                })}
            </div>
        </RowWrapper>
    )
}
