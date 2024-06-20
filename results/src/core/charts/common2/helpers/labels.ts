import { QuestionMetadata } from '@devographics/types'
import { StringTranslator } from '@devographics/react-i18n'
import { getEntityName } from 'core/helpers/entities'
import { CustomizationFiltersSeries, FilterItem } from 'core/filters/types'
import { Entity } from '@devographics/types'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import { useEntities } from 'core/helpers/entities'
import { usePageContext } from 'core/helpers/pageContext'
import { useAllQuestionsMetadata } from '../../horizontalBar2/helpers/other'
import round from 'lodash/round'

/*

How to format chart labels

*/
export const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
})

export const yenFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0
})

// TODO: find a better way to define this
export const isDollar = (question: QuestionMetadata) => ['yearly_salary'].includes(question.id)

export const isYen = (question: QuestionMetadata) =>
    ['current_total_annual_compensation'].includes(question.id)

export const isPercentage = (question: QuestionMetadata) =>
    ['completion_stats'].includes(question.id)

// https://stackoverflow.com/a/9462382
function largeNumberFormatter(num: number, digits = 1) {
    const lookup = [
        { value: 1, symbol: '' },
        { value: 1e3, symbol: 'k' },
        { value: 1e6, symbol: 'M' },
        { value: 1e9, symbol: 'B' },
        { value: 1e12, symbol: 'T' },
        { value: 1e15, symbol: 'P' },
        { value: 1e18, symbol: 'E' }
    ]
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
    const item = lookup
        .slice()
        .reverse()
        .find(function (item) {
            return num >= item.value
        })
    return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0'
}

export const formatNumber = new Intl.NumberFormat().format

export const roundPercentage = (value: number) => {
    if (value < 0.1) {
        return round(value, 2)
    } else if (value < 1) {
        return round(value, 1)
    } else {
        return round(value)
    }
}
export const formatPercentage = (value: number) => {
    return `${roundPercentage(value)}%`
}

export const formatQuestionValue = (value: number, question: QuestionMetadata) => {
    if (isDollar(question)) {
        return usdFormatter.format(value)
    } else if (isYen(question)) {
        return `¥${largeNumberFormatter(value)}`
    } else if (isPercentage(question)) {
        return formatPercentage(value)
    } else {
        return formatNumber(value)
    }
}

export const getQuestionLabel = ({
    getString,
    question,
    i18nNamespace
}: {
    getString: StringTranslator
    question: QuestionMetadata
    i18nNamespace?: string
}) => {
    let key, label, i18nNamespace_
    const { sectionId, template, entity, id } = question
    const entityName = entity && getEntityName(entity)
    if (entityName) {
        label = entityName
    } else {
        if (i18nNamespace) {
            i18nNamespace_ = i18nNamespace
        } else if (sectionId === 'other_tools') {
            i18nNamespace_ = `tools_others`
        } else if (['feature', 'feature3'].includes(template)) {
            i18nNamespace_ = `features`
        } else if (template === 'tool') {
            i18nNamespace_ = `tools`
        } else {
            i18nNamespace_ = sectionId
        }
        key = `${i18nNamespace_}.${id}`
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
                const { key, label } = getItemLabel({
                    id: valueString,
                    getString,
                    entity: entities.find(e => e.id === valueString),
                    i18nNamespace: optionI18nNamespace
                })
                return label
            })
            .join(', ')
        return { questionLabel, operatorLabel, valueLabel } as FilterLabelObject
    })
    return labelSegments
}
