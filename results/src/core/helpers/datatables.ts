import { BlockUnits, BlockLegend, BucketItem } from 'core/types'
import { isPercentage } from 'core/helpers/units'

interface TableBucketItem extends BucketItem {
    label?: string
}
interface TableParams {
    data: TableBucketItem[]
    legends?: BlockLegend[]
    valueKeys?: BlockUnits[]
    translateData?: boolean
    i18nNamespace?: string
}

interface TableData {
    headings: TableDataHeading[]
    rows: TableDataRow[]
}

interface TableDataHeading {
    id: string
    labelId: string
}

type TableDataRow = TableDataCell[]

interface TableDataCell {
    id: string | number
    label?: string | number
    labelId?: string | number
    value?: string | number
    translateData?: boolean
}

const getLabel = (id: string | number, legends?: BlockLegend[]) => {
    const legend = legends && legends.find((key) => key.id === id)
    return legend ? legend.shortLabel || legend.label : id
}

const getValue = (row: TableBucketItem, units: BlockUnits) => {
    const value = row[units]
    return isPercentage(units) ? `${value}%` : value
}

const defaultValueKeys: BlockUnits[] = ['percentage_survey', 'percentage_question', 'count']

export const getTableData = (params: TableParams): TableData => {
    const { data, legends, valueKeys = defaultValueKeys, translateData, i18nNamespace } = params
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

    return { headings, rows }
}
