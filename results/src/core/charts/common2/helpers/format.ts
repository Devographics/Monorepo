import { QuestionMetadata } from '@devographics/types'
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
