import { ResolverMap } from '../../types'
import { rawDataResolver } from './raw_data'
import { allEditionsResolver, currentEditionResolver } from './editions'

export const responsesResolverMap: ResolverMap = {
    allEditions: allEditionsResolver,
    currentEdition: currentEditionResolver,
    rawData: rawDataResolver
}
