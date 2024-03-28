import './RowHeading.scss'
import React from 'react'
import { RowCommonProps, RowExtraProps } from './types'
import { FreeformIcon } from 'core/icons'
import { Item } from './item'

export const RowHeading = ({
    bucket,
    block,
    isGroupedBucket,
    showGroupedBuckets,
    setShowGroupedBuckets
}: RowCommonProps & RowExtraProps) => {
    const { entity, id, label } = bucket
    const { isFreeformData } = bucket
    const { i18nNamespace = block.fieldId || block.id } = block

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
            {isFreeformData && (
                <FreeformIcon
                    className="chart-row-freeform-icon"
                    size="petite"
                    labelId="charts.freeform_data.description"
                />
            )}
            {setShowGroupedBuckets && (
                <button onClick={() => setShowGroupedBuckets(!showGroupedBuckets)}>
                    {showGroupedBuckets ? '-' : `+${bucket.groupedBuckets?.length}`}
                </button>
            )}
        </h3>
    )
}
