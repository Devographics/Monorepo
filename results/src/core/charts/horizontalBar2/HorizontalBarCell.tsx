import React, { useEffect, useRef, useState } from 'react'
import Tooltip from 'core/components/Tooltip'
import { Bucket, FacetBucket } from '@devographics/types'
import {
    HorizontalBarChartState,
    HorizontalBarChartValues,
    HorizontalBarViewDefinition
} from './types'
import T from 'core/i18n/T'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import { useWidth } from '../common2/helpers'
import { CellLabel } from '../common2'
import { getQuestionLabel } from '../common2/helpers/labels'
import { BlockVariantDefinition } from 'core/types'
import { ColumnModes } from '../common2/types'
import OtherBucketMarker from './OtherBucketMarker'
import { OTHER_ANSWERS } from '@devographics/constants'

// hide labels for cells under this size
export const MINIMUM_CELL_SIZE_TO_SHOW_LABEL = 30

export const useIsWideEnough = () => {
    const ref = useRef<HTMLDivElement>(null)
    const cellWidth = useWidth(ref)
    const [isWideEnough, setIsWideEnough] = useState(false)

    useEffect(() => {
        setIsWideEnough(!!(cellWidth && cellWidth > MINIMUM_CELL_SIZE_TO_SHOW_LABEL))
    }, [cellWidth])
    return { ref, isWideEnough, cellWidth }
}

export const Cell = ({
    block,
    bucket,
    otherBucket,
    chartState,
    chartValues,
    width: width_,
    getWidth,
    offset,
    cellIndex,
    gradient,
    viewDefinition,
    oversizedBar = false,
    parentTotal
}: {
    block: BlockVariantDefinition
    bucket: Bucket | FacetBucket
    otherBucket?: Bucket | FacetBucket
    chartState: HorizontalBarChartState
    chartValues: HorizontalBarChartValues
    width?: number
    getWidth?: (v: number) => number
    offset: number
    cellIndex: number
    gradient: string[]
    viewDefinition: HorizontalBarViewDefinition<HorizontalBarChartState>
    oversizedBar: boolean
    parentTotal: number
}) => {
    const { ref, isWideEnough: showLabel } = useIsWideEnough()
    const { variables = {} } = block
    const { disableOtherBucket = false } = variables

    // const entities = useEntities()
    // const entity = entities.find(e => e.id === bucket.id)
    const { question, facetQuestion, totalRespondents, serieMetadataProps } = chartValues
    const { sort, view, highlightedCell, setHighlightedCell, columnMode } = chartState
    const { getValue, formatValue } = viewDefinition
    const { getString } = useI18n()

    const { id, count, entity, token } = bucket
    const value = getValue(bucket)

    const isOtherAnswersBucket = id === OTHER_ANSWERS
    // sometimes we pass an explicit width, sometimes we pass
    // a getWidth function
    const width = width_ || (getWidth && getWidth(value))

    const style = {
        '--percentageValue': value,
        '--width': width,
        '--offset': offset,
        '--color1': gradient[0],
        '--color2': gradient[1]
    }

    let facetQuestionLabel
    if (facetQuestion) {
        const facetQuestionLabelObject = getQuestionLabel({
            getString,
            question: facetQuestion
        })
        facetQuestionLabel = facetQuestionLabelObject.label
    }

    const i18nNamespace =
        block?.i18nNamespace ||
        facetQuestion?.i18nNamespace ||
        question?.i18nNamespace ||
        facetQuestion?.id ||
        question?.id ||
        block.fieldId ||
        block.id

    const itemLabel = getItemLabel({
        getString,
        i18nNamespace,
        id,
        entity
    })
    const { label: cellLabel } = itemLabel

    const v = formatValue(value, facetQuestion || question, chartState)

    const isActiveSort = sort === id
    const isHighlighted = highlightedCell === id
    const className = `chart-cell chart-cell-${
        isHighlighted ? 'highlighted' : ''
    } horizontal-chart-cell ${isActiveSort ? 'active-sort' : ''}`

    const label = facetQuestionLabel
        ? `${facetQuestionLabel}: <strong>${cellLabel}</strong>`
        : cellLabel

    // when we're in stacked column mode, we're counting answers, not
    // respondents (because many questions allow more than one answers)
    const isStacked = columnMode === ColumnModes.STACKED

    return (
        <div
            className={className}
            style={style}
            ref={ref}
            onMouseEnter={() => {
                setHighlightedCell(id)
            }}
            onMouseLeave={() => {
                setHighlightedCell(null)
            }}
        >
            <Tooltip
                trigger={
                    <div className="chart-cell-inner">
                        {showLabel && <CellLabel label={v} />}
                        {oversizedBar && <Oversized />}
                    </div>
                }
                contents={
                    <div>
                        [<span dangerouslySetInnerHTML={{ __html: label }} />] <strong>{v}</strong>{' '}
                        {isStacked ? (
                            <T
                                k="charts.facet_detail_answers"
                                values={{ count, totalAnswers: parentTotal }}
                            />
                        ) : (
                            <T
                                k="charts.facet_detail"
                                values={{ count, totalRespondents: parentTotal }}
                            />
                        )}
                    </div>
                }
                showBorder={false}
            />
            {/* we need getWidth to be able to figure out the dimensions for the other bucket marker */}
            {otherBucket && getWidth && !disableOtherBucket && !isOtherAnswersBucket && (
                <>
                    <OtherBucketMarker
                        viewDefinition={viewDefinition}
                        mainBucket={bucket}
                        otherBucket={otherBucket}
                        getWidth={getWidth}
                    />
                </>
            )}
        </div>
    )
}

const Oversized = () => {
    return (
        <span className="oversized-indicator">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="39"
                height="73"
                fill="none"
                viewBox="0 0 39 73"
            >
                <path
                    className="break-fill"
                    d="M4 27.53 12-1h23l-5.765 23.271H35l-5.765 23.272H35L28 74H4l6.222-23.235H4l6.222-23.236z"
                ></path>
                <path
                    className="break-stroke"
                    strokeWidth="6"
                    d="M12-1 4 27.53h6.222L4 50.764h6.222L4 74M35-1l-5.765 23.271H35l-5.765 23.272H35L28 74"
                ></path>
            </svg>
        </span>
    )
}
