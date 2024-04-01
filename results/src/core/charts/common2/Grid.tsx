import { CustomizationFiltersSeries, DataSeries, FilterItem } from 'core/filters/types'
import './Grid.scss'
import React, { ReactNode } from 'react'
import { useAllQuestionsMetadata } from '../horizontalBar2/helpers/other'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import { useEntities } from 'core/helpers/entities'
import { usePageContext } from 'core/helpers/pageContext'
import { getQuestionLabel } from '../horizontalBar2/helpers/labels'

const useFiltersLabel = (filters: CustomizationFiltersSeries) => {
    const context = usePageContext()
    const { i18nNamespaces } = context
    const { getString } = useI18n()
    const entities = useEntities()
    const allQuestions = useAllQuestionsMetadata()

    const labelSegments = filters.conditions.map(({ fieldId, operator, value }) => {
        const question = allQuestions.find(q => q.id === fieldId) as FilterItem
        const optionI18nNamespace = i18nNamespaces[question.id] || question.id

        const { key, label: questionLabel } = getQuestionLabel({
            getString,
            question,
            i18nNamespace: question.i18nNamespace || question.sectionId
        })
        const operatorLabel = getString(`filters.operators.${operator}`, {}, operator)?.t
        const valueArray = Array.isArray(value) ? value : [value]
        const valueLabel = valueArray
            .map(valueString => {
                const { key, label } = getItemLabel({
                    id: valueString,
                    getString,
                    entity: entities.find(e => e.id === valueString),
                    i18nNamespace: optionI18nNamespace
                })
                return label
            })
            .join(', ')
        return `<strong>${questionLabel}</strong> <span class="operator">${operatorLabel}</span> <strong>${valueLabel}</strong>`
    })
    const label = labelSegments.join(', ')
    return label
}

export const GridWrapper = ({
    seriesCount,
    children
}: {
    seriesCount: number
    children: ReactNode
}) => {
    return (
        <div className={seriesCount > 1 ? 'chart-wrapper-grid' : 'chart-wrapper-single'}>
            {children}
        </div>
    )
}

export const GridItem = ({
    children,
    filters
}: {
    children: ReactNode
    filters?: CustomizationFiltersSeries
}) => {
    return (
        <div className="chart-grid-item">
            {filters && <GridItemHeading filters={filters} />}
            <div className="chart-grid-item-contents">{children}</div>
        </div>
    )
}

export const GridItemHeading = ({ filters }: { filters: CustomizationFiltersSeries }) => {
    const label = useFiltersLabel(filters)
    return (
        <div className="chart-grid-item-heading">
            <span
                dangerouslySetInnerHTML={{
                    __html: label
                }}
            />
        </div>
    )
}
