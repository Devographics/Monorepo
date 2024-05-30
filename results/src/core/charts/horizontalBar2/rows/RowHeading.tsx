import React from 'react'
import { Item } from '../../common2/item'
import { RowComponentProps } from '../types'

export const RowHeading = ({
    bucket,
    block,
    isGroupedBucket,
    showGroupedBuckets,
    setShowGroupedBuckets
}: RowComponentProps) => {
    const { entity, id, label } = bucket
    const { isFreeformData } = bucket
    const i18nNamespace = block.fieldId || block.id

    return (
        <h3 className="chart-row-heading">
            {isGroupedBucket && <span className="chart-row-heading-grouped">↳&nbsp;</span>}
            <Item
                id={id}
                entity={entity}
                bucket={bucket}
                i18nNamespace={i18nNamespace}
                label={label}
            />
            {setShowGroupedBuckets && (
                <button
                    onClick={() => setShowGroupedBuckets(!showGroupedBuckets)}
                    aria-expanded={showGroupedBuckets}
                >
                    {showGroupedBuckets ? '-' : `+${bucket.groupedBuckets?.length}`}
                </button>
            )}
        </h3>
    )
}
