import { ResponseData, ResultsSubFieldEnum, StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { BlockVariantDefinition } from 'core/types'

export const getChartCurrentEdition = ({
    serie,
    block
}: {
    serie: DataSeries<StandardQuestionData>
    block: BlockVariantDefinition
}) => {
    const subField = block?.queryOptions?.subField || ResultsSubFieldEnum.RESPONSES
    const { allEditions } = serie.data[subField] as ResponseData
    return allEditions.at(-1)
}
