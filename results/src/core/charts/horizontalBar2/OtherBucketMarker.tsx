import React from 'react'
import Tooltip from 'core/components/Tooltip'
import { Bucket, FacetBucket } from '@devographics/types'
import { HorizontalBarChartState, OtherBucketsType } from './types'
import './OtherBucketMarker.scss'
import { useI18n } from '@devographics/react-i18n'

const compareWithPreviousEdition = true

export const OtherBucketMarker = ({
    mainBucket,
    otherBucket,
    otherBucketsType,
    getWidth,
    viewDefinition
}: {
    mainBucket: Bucket | FacetBucket
    otherBucket: Bucket | FacetBucket
    otherBucketsType: OtherBucketsType
    getWidth: (v: number) => number
    viewDefinition: HorizontalBarChartState['viewDefinition']
}) => {
    const { getString } = useI18n()
    const { getValue, formatValue } = viewDefinition

    const mainValue = getValue(mainBucket)
    const mainWidth = getWidth(mainValue)
    const otherValue = getValue(otherBucket)
    const delta = otherValue - mainValue
    const absoluteDelta = Math.round(Math.abs(delta))
    const deltaIsNegative = otherValue > mainValue
    // if (deltaIsNegative) {
    //     return null
    // }
    const deltaAbsoluteWidth = getWidth(absoluteDelta)
    // we need to express the delta's width as a percentage of the main width
    const deltaRelativeWidth = (deltaAbsoluteWidth * 100) / mainWidth
    const style = { '--deltaWidthPercentage': deltaRelativeWidth }

    const indexDelta = otherBucket.index - mainBucket.index
    const absoluteIndexDelta = Math.abs(indexDelta)
    const indexDeltaIsNegative = indexDelta < 0

    const tooltipSegments = []

    if (compareWithPreviousEdition) {
        if (absoluteDelta > 0) {
            tooltipSegments.push(
                getString(
                    `charts.other_bucket.${otherBucketsType}.percents.${
                        deltaIsNegative ? 'negative' : 'positive'
                    }`,
                    { values: { value: absoluteDelta } }
                )?.t
            )
        }
        if (absoluteIndexDelta > 0) {
            tooltipSegments.push(
                getString(
                    `charts.other_bucket.ranks.${indexDeltaIsNegative ? 'negative' : 'positive'}`,
                    { values: { value: absoluteIndexDelta } }
                )?.t
            )
        }
    }

    return (
        <>
            <Tooltip
                trigger={
                    <div
                        className={`other-bucket-marker other-bucket-marker-${
                            deltaIsNegative ? 'negativeDelta' : 'positiveDelta'
                        }`}
                        style={style}
                    >
                        {/* <span>{otherBucket.percentageQuestion}</span> */}

                        {indexDelta !== 0 && (
                            <span className="other-bucket-index-delta" style={style}>
                                {indexDelta > 0 ? '+' : '-'}
                                {Math.abs(indexDelta)}
                            </span>
                        )}
                    </div>
                }
                contents={
                    <div>
                        {tooltipSegments.join(', ')}
                        {/* {deltaIsNegative ? '-' : '+'}
                        {formatValue(absoluteDelta)} */}

                        {/* [<span dangerouslySetInnerHTML={{ __html: label }} />] <strong>{v}</strong>{' '}
                    <T
                        k="charts.facet_detail"
                        values={{ count, totalRespondents: totalSerieRespondents }}
                    /> */}
                    </div>
                }
                showBorder={false}
            />{' '}
        </>
    )
}

export default OtherBucketMarker
