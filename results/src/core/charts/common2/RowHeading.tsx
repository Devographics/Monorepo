import React from 'react'
import { RowCommonProps, RowExtraProps } from './types'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'

export const RowHeading = ({
    bucket,
    block,
    isGroupedBucket,
    showGroupedBuckets,
    setShowGroupedBuckets
}: RowCommonProps & RowExtraProps) => {
    const { entity, id, label } = bucket
    const { getString } = useI18n()
    const { i18nNamespace = block.fieldId || block.id } = block
    const labelObject = getItemLabel({ id, label, entity, getString, i18nNamespace })
    return (
        <h3 className="chart-row-heading">
            {isGroupedBucket && <span>↳&nbsp;</span>}
            <span>{labelObject.label}</span>
            {setShowGroupedBuckets && (
                <button onClick={() => setShowGroupedBuckets(!showGroupedBuckets)}>
                    {showGroupedBuckets ? '-' : `+${bucket.groupedBuckets?.length}`}
                </button>
            )}
        </h3>
    )
}
