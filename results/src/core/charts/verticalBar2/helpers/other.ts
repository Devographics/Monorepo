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

export const getEditionByYear = (year: number, editions: Array<ResponseEditionData>) =>
    editions.find(e => e.year === year)
