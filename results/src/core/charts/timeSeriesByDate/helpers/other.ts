import {
    ResponseData,
    ResponseEditionData,
    ResultsSubFieldEnum,
    StandardQuestionData
} from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { BlockVariantDefinition } from 'core/types'

export const getAllEditions = ({
    serie,
    block
}: {
    serie: DataSeries<StandardQuestionData>
    block: BlockVariantDefinition
}) => {
    const subField = block?.queryOptions?.subField || ResultsSubFieldEnum.RESPONSES
    const { allEditions } = serie.data[subField] as ResponseData
    return allEditions
}

export const getEditionByYear = (columnId: string | number, editions: Array<ResponseEditionData>) =>
    editions.find(e => e.year.toString() === columnId)

export function diffDays(d1: Date, d2: Date) {
    const oneDay = 24 * 60 * 60 * 1000 // hours*minutes*seconds*milliseconds
    return Math.round(Math.abs((d1.valueOf() - d2.valueOf()) / oneDay))
}

export function addDaysToDate(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}

export function formatDateToYMD(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}
