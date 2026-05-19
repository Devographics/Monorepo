import React from 'react'
import { ChartItem } from '../../common2/item'
import { RowComponentProps } from '../types'
import { FreeformIndicator } from 'core/charts/common2'
import T from 'core/i18n/T'
import { useQuestionById } from 'core/helpers/options'

export const RowHeading = ({
    bucket,
    block,
    nestedBuckets,
    isNestedBucket,
    showNestedBuckets,
    setShowNestedBuckets,
    serieMetadata
}: RowComponentProps) => {
    const { entity, id, label } = bucket
    const { isFreeformData } = bucket

    const axis1 = block?.filtersState?.axis1
    const axis1Question = axis1 && useQuestionById(axis1.id)

    const i18nNamespace =
        axis1Question?.i18nNamespace ||
        axis1Question?.id ||
        block.i18nNamespace ||
        block.fieldId ||
        block.id
    const sectionId = bucket?._metadata?.sectionId

    return (
        <div className="chart-row-heading">
            {sectionId && (
                <span className="chart-row-heading-section">
                    <T k={`${i18nNamespace}.${sectionId}`} useShort={true} />
                </span>
            )}
            <div className="chart-row-heading-content">
                <div className="chart-row-heading-content-left">
                    <ChartItem
                        id={id}
                        entity={entity}
                        bucket={bucket}
                        i18nNamespace={i18nNamespace}
                        label={label}
                        serieMetadata={serieMetadata}
                        showNestedBuckets={showNestedBuckets}
                        setShowNestedBuckets={setShowNestedBuckets}
                    />
                    {isFreeformData && <FreeformIndicator />}
                </div>
                {nestedBuckets && (
                    <div className="chart-row-heading-content-count">
                        <span>{nestedBuckets.length}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
