import { BlockUnits, BlockLegend, BucketItem } from 'core/types'
import { isPercentage } from 'core/helpers/units'

export interface TableBucketItem {
    id: string
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
    value?: number | number[]
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
            columns.push({ id: key, value: getValue(row, key) })
        })

        return [firstColumn, ...columns]
    })

    return { title, headings, rows, years }
}
