import { BlockUnits, BlockLegend, BucketItem } from '@types/index'
import { Entity, ResponseEditionData } from '@devographics/types'
import { isPercentage } from 'core/helpers/units'
import get from 'lodash/get'
import { CUTOFF_ANSWERS, NO_ANSWER, NO_MATCH } from '@devographics/constants'
import round from 'lodash/round'

export interface TableBucketItem {
    id: string | number
    entity?: Entity
    label?: string
    count?: number | TableBucketYearValue[]
    displayAsPercentage?: boolean
    percentageSurvey?: number | TableBucketYearValue[]
    // percentage relative to the number of question respondents
    percentageQuestion?: number | TableBucketYearValue[]
    // percentage relative to the number of respondents in the facet
    percentageBucket?: number | TableBucketYearValue[]
}

export interface TableBucketYearValue {
    year: number
    value: number
    isPercentage: boolean
}

export interface TableParams {
    id?: string
    title?: string
    data: TableBucketItem[]
    legends?: BlockLegend[]
    valueKeys?: string[] | TableHeading[]
    translateData?: boolean
    i18nNamespace?: string
    years?: number[]
}

export interface TableHeading {
    id: string
    labelId: string
    isPercentage?: boolean
}
export interface TableData {
    headings: TableDataHeading[]
    rows: TableDataRow[]
    title?: string
    years?: number[]
}

export interface TableDataHeading {
    id: string
    labelId: string
}

export type TableDataRow = TableDataCell[]

export interface TableDataCell {
    id: string | number
    label?: string | number
    labelId?: string | number
    value?: number | TableBucketYearValue[]
    translateData?: boolean
    isPercentage?: boolean
}

// const getLabel = (id: string | number, legends?: BlockLegend[]) => {
//     const legend = legends && legends.find(key => key.id === id)
//     return legend ? legend.shortLabel || legend.label : id
// }

const getValue = (row: TableBucketItem, units: BlockUnits) => {
    const value = get(row, units)
    return value
}

const defaultValueKeys: BlockUnits[] = ['percentageSurvey', 'percentageQuestion', 'count']

export const getTableData = (params: TableParams): TableData => {
    const {
        title,
        data,
        legends,
        valueKeys = defaultValueKeys,
        translateData,
        i18nNamespace,
        years
    } = params
    const headings = [{ id: 'label', labelId: 'table.label' }]

    valueKeys.forEach(k => {
        const heading = typeof k === 'object' ? k : { id: k, labelId: `table.${k}` }
        headings.push(heading)
    })

    const rows = data.map(row => {
        if (!row) {
            return
        }
        const firstColumn: TableDataCell = {
            id: 'label',
            translateData
        }
        firstColumn.labelId =
            row.id === NO_MATCH
                ? 'charts.no_match'
                : row.id === CUTOFF_ANSWERS
                ? 'charts.cutoff_answers'
                : row.id === NO_ANSWER
                ? 'charts.no_answer'
                : `options.${i18nNamespace}.${row.id}`
        firstColumn.label = row.label ?? (row?.entity?.nameHtml || row?.entity?.nameClean)
        const columns: TableDataCell[] = []

        valueKeys.forEach(key => {
            const valueKey = typeof key === 'object' ? key.id : key
            const valueIsPercentage =
                typeof key === 'object' ? key.isPercentage : isPercentage(valueKey)
            columns.push({
                id: valueKey,
                value: getValue(row, valueKey),
                isPercentage: row.displayAsPercentage ?? valueIsPercentage
            })
        })

        return [firstColumn, ...columns]
    })

    return { title, headings, rows, years }
}

export const groupDataByYears = ({
    keys = [],
    data = [],
    valueKeys = defaultValueKeys
}: {
    data: ResponseEditionData[]
    valueKeys?: string[] | TableHeading[]
    keys: string[]
}) => {
    const years = data.map(y => y.year)
    return keys.map(key => {
        const bucket: TableBucketItem = {
            id: key
        }
        valueKeys.forEach(valueKey => {
            bucket[valueKey] = years.map(year => ({
                year,
                value: getBucketValue({ data, year, key, valueKey }),
                isPercentage: isPercentage(valueKey)
            }))
        })
        return bucket
    })
}

export const getBucketValue = ({
    data,
    year,
    key,
    valueKey
}: {
    data: ResponseEditionData[]
    year: number
    key: number | string
    valueKey: BlockUnits
}) => {
    const yearData = data.find(d => d.year === year)
    const yearBuckets = yearData.buckets
    const bucket = yearBuckets.find(b => b.id === key)
    return bucket && bucket[valueKey]
}
