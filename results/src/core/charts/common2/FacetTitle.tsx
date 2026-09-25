import './FacetTitle.scss'
import React from 'react'
import { BlockVariantDefinition } from 'core/types'
import { QuestionMetadata } from '@devographics/types'
import { useI18n } from '@devographics/react-i18n'
import T from 'core/i18n/T'
import { QuestionPill } from './QuestionPill'

export const FacetTitle = ({
    facetQuestion,
    block,
    question: question_
}: {
    facetQuestion: QuestionMetadata
    block?: BlockVariantDefinition
    question: QuestionMetadata
}) => {
    const question = {
        ...question_,
        sectionId:
            block?.filtersState?.axis1?.sectionId || question_.sectionId || question_.section.id,
        id: block?.filtersState?.axis1?.id || question_.id
    }
    const i18nNamespace =
        block?.filtersState?.axis1?.sectionId ?? block?.queryOptions?.sectionId ?? block?.sectionId

    return (
        <div className="chart-facet-title">
            <QuestionPill question={question} i18nNamespace={i18nNamespace} /> <T k="charts.vs" />
            <QuestionPill question={facetQuestion} />
        </div>
    )
}
