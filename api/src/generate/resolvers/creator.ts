import { Creator } from '@devographics/types'
import { getEntity } from '../../load/entities'
import { RequestContext } from '../../types'

export const creatorResolverMap = {
    entity: async (parent: Creator, {}, context: RequestContext) => {
        console.log('// creators entity resolver')
        const { id } = parent
        const entity = await getEntity({ id, context })
        return entity
    }
}
