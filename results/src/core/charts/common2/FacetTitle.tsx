import './FacetTitle.scss'
import React from 'react'
import { BlockVariantDefinition, PageContextValue } from 'core/types'
import { Entity, QuestionMetadata } from '@devographics/types'
import { useI18n } from '@devographics/react-i18n'
import Tooltip from 'core/components/Tooltip'
import { QuestionIcon } from 'core/icons'
import T from 'core/i18n/T'
import { getQuestionLabel } from './helpers/labels'

export const FacetTitle = ({
    facetQuestion,
    block,
    question
}: {
    facetQuestion: QuestionMetadata
    block: BlockVariantDefinition
    pageContext: PageContextValue
    entities: Entity[]
    question: QuestionMetadata
}) => {
    const { getString } = useI18n()

    const { label: questionLabel } = getQuestionLabel({
        getString,
        block,
        question,
        i18nNamespace: block.sectionId
    })

    const { label: facetLabel } = getQuestionLabel({
        getString,
        block,
        question: facetQuestion,
        i18nNamespace: facetQuestion.i18nNamespace
    })

    return (
        <div className="chart-facet-title">
            <span className="chart-facet-title-item chart-facet-question">{questionLabel}</span>{' '}
            <T k="charts.vs" />{' '}
            <Tooltip
                trigger={
                    <span className="chart-facet-title-item chart-facet-facet">
                        {facetLabel}
                        <QuestionIcon size="petite" />
                    </span>
                }
                contents={facetLabel}
            />
        </div>
    )
}
