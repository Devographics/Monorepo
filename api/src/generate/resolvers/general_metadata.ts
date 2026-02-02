import { RequestContext } from '../../types'
import { getGeneralMetadata } from '../helpers'

export const generalMetadataResolverMap = {
    creators: async (parent_: any, context: RequestContext) => {
        console.log('// creators resolver')

        const general = getGeneralMetadata({ context })
        return general.creators
    }
}
