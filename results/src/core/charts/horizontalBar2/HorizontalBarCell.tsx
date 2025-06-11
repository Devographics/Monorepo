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
import { getViewDefinition } from './helpers/views'
import { getQuestionLabel } from '../common2/helpers/labels'
import { BlockVariantDefinition } from 'core/types'

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
    chartState,
    chartValues,
    width,
    offset,
    cellIndex,
    gradient,
    viewDefinition,
    oversizedBar = false
}: {
    block: BlockVariantDefinition
    bucket: Bucket | FacetBucket
    chartState: HorizontalBarChartState
    chartValues: HorizontalBarChartValues
    width: number
    offset: number
    cellIndex: number
    gradient: string[]
    viewDefinition: HorizontalBarViewDefinition<HorizontalBarChartState>
    oversizedBar: boolean
}) => {
    const { ref, isWideEnough: showLabel } = useIsWideEnough()

    // const entities = useEntities()
    // const entity = entities.find(e => e.id === bucket.id)
    const { question, facetQuestion, totalRespondents, serieMetadataProps } = chartValues
    const { completion } = serieMetadataProps
    const { count: totalSerieRespondents } = completion
    const { sort, view, highlightedCell, setHighlightedCell } = chartState
    const { getValue, formatValue } = viewDefinition
    const { getString } = useI18n()

    const { id, count, entity, token } = bucket
    const value = getValue(bucket)
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

    const v = formatValue(value, question, chartState)

    const isActiveSort = sort === id
    const isHighlighted = highlightedCell === id
    const className = `chart-cell chart-cell-${
        isHighlighted ? 'highlighted' : ''
    } horizontal-chart-cell ${isActiveSort ? 'active-sort' : ''}`

    const label = facetQuestionLabel ? `${facetQuestionLabel}: ${cellLabel}` : cellLabel

    return (
        <Tooltip
            trigger={
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
                    {showLabel && <CellLabel label={v} />}
                    {oversizedBar && <Oversized />}
                </div>
            }
            contents={
                <div>
                    [{label}] <strong>{v}</strong>{' '}
                    <T
                        k="charts.facet_detail"
                        values={{ count, totalRespondents: totalSerieRespondents }}
                    />
                </div>
            }
            showBorder={false}
        />
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
