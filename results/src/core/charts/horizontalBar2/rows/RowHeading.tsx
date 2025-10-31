import React from 'react'
import { ChartItem } from '../../common2/item'
import { RowComponentProps } from '../types'
import { FreeformIndicator } from 'core/charts/common2'

export const RowHeading = ({
    bucket,
    block,
    isGroupedBucket,
    showGroupedBuckets,
    setShowGroupedBuckets,
    serieMetadata
}: RowComponentProps) => {
    const { entity, id, label } = bucket
    const { isFreeformData } = bucket
    const i18nNamespace =
        block?.filtersState?.axis1?.id || block.i18nNamespace || block.fieldId || block.id
    return (
        <h3 className="chart-row-heading">
            {/* {isGroupedBucket && <span className="chart-row-heading-grouped">↳&nbsp;</span>} */}
            <ChartItem
                id={id}
                entity={entity}
                bucket={bucket}
                i18nNamespace={i18nNamespace}
                label={label}
                serieMetadata={serieMetadata}
            />

            {isFreeformData && <FreeformIndicator />}
            {/* {setShowGroupedBuckets && (
                <button
                    onClick={() => setShowGroupedBuckets(!showGroupedBuckets)}
                    aria-expanded={showGroupedBuckets}
                >
                    {showGroupedBuckets ? '-' : `+${bucket.groupedBuckets?.length}`}
                </button>
            )} */}
        </h3>
    )
}
