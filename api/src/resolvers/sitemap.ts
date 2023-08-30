import { RequestContext } from '../types'
import { getEntity } from '../load/entities'

export const sitemapBlockResolverMap = {
    entity: async (parent: any, args: any, context: RequestContext) => {
        const { id } = parent
        return await getEntity({ id, context })
    }
}
