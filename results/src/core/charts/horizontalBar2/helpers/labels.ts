import { Question, QuestionMetadata } from '@devographics/types'
import { ChartState, Views } from '../types'
import { ChartValues } from 'core/charts/multiItemsExperience/types'
import round from 'lodash/round'
import { StringTranslator } from '@devographics/react-i18n'
import { getEntityName } from 'core/helpers/entities'

export const isPercentage = (view: ChartState['view']) =>
    [Views.PERCENTAGE_BUCKET, Views.PERCENTAGE_QUESTION].includes(view)

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

export const formatPercentage = (value: number) => `${Math.floor(value)}%`

export const formatValue = ({
    value,
    chartState,
    question
}: {
    value: number
    chartState: ChartState
    question: QuestionMetadata
}) => {
    const { view } = chartState
    if (isPercentage(view)) {
        return formatPercentage(value)
    } else if ([Views.BOXPLOT, Views.AVERAGE].includes(view)) {
        if (isDollar(question)) {
            return usdFormatter.format(value)
        } else if (isYen(question)) {
            return `¥${largeNumberFormatter(value)}`
        }
    }
    return value.toString()
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
