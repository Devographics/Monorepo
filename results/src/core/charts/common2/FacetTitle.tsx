import './FacetTitle.scss'
import React from 'react'
import { BlockVariantDefinition, PageContextValue } from 'core/types'
import { Entity, QuestionMetadata } from '@devographics/types'
import { useI18n } from '@devographics/react-i18n'
import Tooltip from 'core/components/Tooltip'
import { QuestionIcon } from 'core/icons'
import T from 'core/i18n/T'
import { getQuestionLabel } from './helpers/labels'
import { getChartView } from '../horizontalBar2/helpers/views'
import { HorizontalBarChartState, HorizontalBarViews } from '../horizontalBar2/types'

export const FacetTitle = ({
    facetQuestion,
    block,
    question,
    chartState
}: {
    facetQuestion: QuestionMetadata
    block: BlockVariantDefinition
    pageContext: PageContextValue
    entities: Entity[]
    question: QuestionMetadata
    chartState: HorizontalBarChartState
}) => {
    const { getString } = useI18n()

    const { key: questionLabelKey, label: questionLabel } = getQuestionLabel({
        getString,
        block,
        question: {
            sectionId: block?.filtersState?.axis1?.sectionId || question.sectionId,
            id: block?.filtersState?.axis1?.id || question.id
        },
        i18nNamespace:
            block?.filtersState?.axis1?.sectionId ??
            block?.queryOptions?.sectionId ??
            block.sectionId
    })

    const {
        key: facetLabelKey,
        label: facetLabel,
        question: facetQuestionLabel
    } = getQuestionLabel({
        getString,
        block,
        question: facetQuestion,
        i18nNamespace: facetQuestion.i18nNamespace
    })

    const { view } = chartState
    return (
        <div className="chart-facet-title">
            <span
                data-key={questionLabelKey}
                className="chart-facet-title-item chart-facet-question"
            >
                {questionLabel}
            </span>{' '}
            <T k="charts.vs" />
            <Tooltip
                trigger={
                    <span
                        data-key={facetLabelKey}
                        className="chart-facet-title-item chart-facet-facet"
                    >
                        {facetLabel}
                        <QuestionIcon size="petite" />
                    </span>
                }
                contents={facetQuestionLabel}
            />
            {view === HorizontalBarViews.AVERAGE && (
                <>
                    {' '}
                    <T k="charts.facet_average" />
                </>
            )}
            {view === HorizontalBarViews.BOXPLOT && (
                <>
                    {' '}
                    <T k="charts.facet_median" />
                </>
            )}
        </div>
    )
}
