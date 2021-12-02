import { BlockUnits, BlockLegend, BucketItem, ResultsByYear } from 'core/types'
import { isPercentage } from 'core/helpers/units'

export interface TableBucketItem {
    id: string | number
    label?: string
    count?: number | TableBucketYearValue[]
    percentage_survey?: number | TableBucketYearValue[]
    // percentage relative to the number of question respondents
    percentage_question?: number | TableBucketYearValue[]
    // percentage relative to the number of respondents in the facet
    percentage_facet?: number | TableBucketYearValue[]
}

export interface TableBucketYearValue {
    year: number
    value: number
    isPercentage: boolean
}

export interface TableParams {
    title?: string
    data: TableBucketItem[]
    legends?: BlockLegend[]
    valueKeys?: BlockUnits[]
    translateData?: boolean
    i18nNamespace?: string
    years?: number[]
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

const getLabel = (id: string | number, legends?: BlockLegend[]) => {
    const legend = legends && legends.find((key) => key.id === id)
    return legend ? legend.shortLabel || legend.label : id
}

const getValue = (row: TableBucketItem, units: BlockUnits) => {
    const value = row[units]
    return value
}

const defaultValueKeys: BlockUnits[] = ['percentage_survey', 'percentage_question', 'count']

export const getTableData = (params: TableParams): TableData => {
    const { title, data, legends, valueKeys = defaultValueKeys, translateData, i18nNamespace, years } = params
    const headings = [{ id: 'label', labelId: 'table.label' }]

    valueKeys.forEach((k) => {
        headings.push({ id: k, labelId: `table.${k}` })
    })

    const rows = data.map((row) => {
        const firstColumn: TableDataCell = {
            id: 'label',
            translateData,
        }
        if (translateData) {
            firstColumn.labelId = `options.${i18nNamespace}.${row.id}`
        } else {
            firstColumn.label = row.label || getLabel(row.id, legends)
        }

        const columns: TableDataCell[] = []

        valueKeys.forEach((key) => {
            columns.push({ id: key, value: getValue(row, key), isPercentage: isPercentage(key) })
        })

        return [firstColumn, ...columns]
    })

    return { title, headings, rows, years }
}

export const groupDataByYears = ({
    keys = [],
    data = [],
    valueKeys = defaultValueKeys,
}: {
    data: ResultsByYear[]
    valueKeys?: BlockUnits[]
    keys: string[]
}) => {
    const years = data.map(y => y.year)
    return keys.map((key) => {
        const bucket: TableBucketItem = {
            id: key,
        }
        valueKeys.forEach((valueKey) => {
            bucket[valueKey] = years.map((year) => ({
                year,
                value: getBucketValue({ data, year, key, valueKey }),
                isPercentage: isPercentage(valueKey),
            }))
        })
        return bucket
    })
}

export const getBucketValue = ({
    data,
    year,
    key,
    valueKey,
}: {
    data: ResultsByYear[]
    year: number
    key: number | string
    valueKey: BlockUnits
}) => {
    const yearData = data.find((d) => d.year === year)
    const yearBuckets = yearData.facets[0].buckets
    const bucket = yearBuckets.find((b) => b.id === key)
    return bucket[valueKey]
}