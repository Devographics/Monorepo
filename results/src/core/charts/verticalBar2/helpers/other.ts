import {
    ResponseData,
    ResponseEditionData,
    ResultsSubFieldEnum,
    StandardQuestionData
} from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { BlockVariantDefinition } from 'core/types'

export const getSubfieldObject = (serie: DataSeries<StandardQuestionData>) => {
    return (
        serie?.data?.[ResultsSubFieldEnum.COMBINED] ||
        serie?.data?.[ResultsSubFieldEnum.FREEFORM] ||
        serie?.data?.[ResultsSubFieldEnum.RESPONSES]
    )
}

export const getAllEditions = ({
    serie,
    block
}: {
    serie: DataSeries<StandardQuestionData>
    block: BlockVariantDefinition
}) => {
    const subFieldObject = getSubfieldObject(serie)

    const allEditions = subFieldObject?.allEditions
    return allEditions
}

export const getEditionByYear = (year: number, editions: Array<ResponseEditionData>) =>
    editions.find(e => e.year === year)
