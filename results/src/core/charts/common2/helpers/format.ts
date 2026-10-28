import type { QuestionMetadata } from '@devographics/types'
import round from 'lodash/round.js'

/*

How to format values (chart labels, takeaways…)

All formatters take the page's locale, so values match the page's language
and are formatted the same way on the server and in the browser.

*/

// TODO: find a better way to define this
export const isDollar = (question: QuestionMetadata) => ['yearly_salary'].includes(question.id)

export const isYen = (question: QuestionMetadata) =>
    ['current_total_annual_compensation'].includes(question.id)

export const isPercentage = (question: QuestionMetadata) =>
    ['completion_stats'].includes(question.id) || ['slider'].includes(question.template)

export const isYears = (question: QuestionMetadata) =>
    ['years_of_experience', 'age'].includes(question.id)

export const roundPercentage = (value: number) => {
    if (value < 0.1) {
        return round(value, 2)
    } else if (value < 1) {
        return round(value, 1)
    } else {
        return round(value)
    }
}

export type LocalizedUnit = 'percentage' | 'count' | 'usd' | 'jpy' | 'years'

export const getQuestionUnit = (question?: QuestionMetadata): LocalizedUnit => {
    if (!question) {
        return 'count'
    } else if (isDollar(question)) {
        return 'usd'
    } else if (isYen(question)) {
        return 'jpy'
    } else if (isPercentage(question)) {
        return 'percentage'
    } else if (isYears(question)) {
        return 'years'
    } else {
        return 'count'
    }
}

export const formatLocalizedValue = ({
    value,
    unit,
    localeId,
    short = false
}: {
    value: number
    unit: LocalizedUnit
    localeId: string
    // short units, e.g. "12 yrs" instead of "12 years"
    short?: boolean
}) => {
    if (unit === 'percentage') {
        return new Intl.NumberFormat(localeId, {
            style: 'percent',
            maximumFractionDigits: 2
        }).format(roundPercentage(value) / 100)
    } else if (unit === 'usd') {
        return new Intl.NumberFormat(localeId, {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(value)
    } else if (unit === 'jpy') {
        // Japanese uses the currency name to get 950万円 instead of ￥950万
        return new Intl.NumberFormat(localeId, {
            style: 'currency',
            currency: 'JPY',
            notation: 'compact',
            currencyDisplay: localeId.startsWith('ja') ? 'name' : 'narrowSymbol'
        }).format(value)
    } else if (unit === 'years') {
        return new Intl.NumberFormat(localeId, {
            style: 'unit',
            unit: 'year',
            unitDisplay: short ? 'short' : 'long'
        }).format(value)
    } else {
        return new Intl.NumberFormat(localeId).format(value)
    }
}

/*

Shortcuts. They also accept the options passed to view definitions' formatValue
({ value, question, chartState, localeId }), so they can be used directly there.

*/
export const formatNumber = ({ value, localeId }: { value: number; localeId: string }) =>
    formatLocalizedValue({ value, unit: 'count', localeId })

export const formatPercentage = ({ value, localeId }: { value: number; localeId: string }) =>
    formatLocalizedValue({ value, unit: 'percentage', localeId })

// charts use short units (e.g. "12 yrs")
export const formatQuestionValue = ({
    value,
    question,
    localeId
}: {
    value: number
    question?: QuestionMetadata
    localeId: string
}) => formatLocalizedValue({ value, unit: getQuestionUnit(question), localeId, short: true })

export const formatUnitValue = ({
    value,
    unit = 'count',
    localeId
}: {
    value: number
    unit?: LocalizedUnit
    localeId: string
}) => formatLocalizedValue({ value, unit, localeId })
