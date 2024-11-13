import { QuestionMetadata } from '@devographics/types'
import type { StringTranslator } from '@devographics/react-i18n'
import { getEntityName } from 'core/helpers/entities'
import { CustomizationFiltersSeries, FilterItem } from 'core/filters/types'
import { Entity } from '@devographics/types'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import { useEntities } from 'core/helpers/entities'
import { usePageContext } from 'core/helpers/pageContext'
import { useAllQuestionsMetadata } from '../../horizontalBar2/helpers/other'
import { isFeatureTemplate, isToolTemplate } from '@devographics/helpers'
import { BlockVariantDefinition } from 'core/types'

export const getQuestionLabel = ({
    getString,
    question,
    i18nNamespace,
    block
}: {
    getString: StringTranslator
    question: QuestionMetadata
    i18nNamespace?: string
    block?: BlockVariantDefinition
}) => {
    let key, label, i18nNamespace_
    const { sectionId, template, entity, id } = question
    const entityName = entity && getEntityName(entity)
    if (entityName) {
        label = entityName
    } else {
        if (block?.titleId) {
            key = block.titleId
        } else {
            if (i18nNamespace) {
                i18nNamespace_ = i18nNamespace
            } else if (sectionId === 'other_tools') {
                i18nNamespace_ = `tools_others`
            } else if (isFeatureTemplate(template)) {
                i18nNamespace_ = `features`
            } else if (isToolTemplate(template)) {
                i18nNamespace_ = `tools`
            } else {
                i18nNamespace_ = sectionId
            }
            key = `${i18nNamespace_}.${id}`
        }
        const s = getString(key)
        label = s?.tClean || s?.t || id
    }
    return { key, label }
}

export const useFiltersLabel = (filters: CustomizationFiltersSeries) => {
    const context = usePageContext()
    const { i18nNamespaces } = context
    const { getString } = useI18n()
    const entities = useEntities()
    const allQuestions = useAllQuestionsMetadata()

    return getFiltersLabel({ i18nNamespaces, getString, entities, allQuestions, filters })
}

type FilterLabelObject = {
    questionLabel: string
    operatorLabel: string
    valueLabel: string
}

export const getFiltersLabel = ({
    i18nNamespaces,
    getString,
    filters,
    entities,
    allQuestions
}: {
    i18nNamespaces: any
    getString: StringTranslator
    filters: CustomizationFiltersSeries
    entities: Entity[]
    allQuestions: QuestionMetadata[]
}) => {
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
                const { key, label, shortLabel } = getItemLabel({
                    id: valueString,
                    getString,
                    entity: entities.find(e => e.id === valueString),
                    i18nNamespace: optionI18nNamespace
                })
                return shortLabel
            })
            .join(', ')
        return { questionLabel, operatorLabel, valueLabel } as FilterLabelObject
    })
    return labelSegments
}
