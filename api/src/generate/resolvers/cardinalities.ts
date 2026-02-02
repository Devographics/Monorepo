import { ResultsSubFieldEnum } from '@devographics/types'
import { getSubfield } from '../subfields'

export const cardinalitiesResolverMap = {
    id: getSubfield(ResultsSubFieldEnum.ID).resolverFunction,
    responses: getSubfield(ResultsSubFieldEnum.RESPONSES).resolverFunction
}
