import { Entity, BlockUnits, BlockLegend, BucketItem, ResultsByYear } from 'core/types'
import { isPercentage } from 'core/helpers/units'
import get from 'lodash/get'

export interface TableBucketItem {
    id: string | number
    entity?: Entity
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

const getLabel = (id: string | number, legends?: BlockLegend[]) => {
    const legend = legends && legends.find(key => key.id === id)
    return legend ? legend.shortLabel || legend.label : id
}

const getValue = (row: TableBucketItem, units: BlockUnits) => {
    const value = get(row, units)
    return value
}

const defaultValueKeys: BlockUnits[] = ['percentage_survey', 'percentage_question', 'count']

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
        const firstColumn: TableDataCell = {
            id: 'label',
            translateData
        }
        if (translateData) {
            firstColumn.labelId = `options.${i18nNamespace}.${row.id}`
        } else {
            firstColumn.label = row.label ?? row?.entity?.name ?? getLabel(row.id, legends)
        }

        const columns: TableDataCell[] = []

        valueKeys.forEach(key => {
            const valueKey = typeof key === 'object' ? key.id : key
            const valueIsPercentage = typeof key === 'object' ? key.isPercentage : isPercentage(valueKey)
            columns.push({
                id: valueKey,
                value: getValue(row, valueKey),
                isPercentage: valueIsPercentage
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
    data: ResultsByYear[]
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
    data: ResultsByYear[]
    year: number
    key: number | string
    valueKey: BlockUnits
}) => {
    const yearData = data.find(d => d.year === year)
    const yearBuckets = yearData.facets[0].buckets
    const bucket = yearBuckets.find(b => b.id === key)
    return bucket[valueKey]
}
