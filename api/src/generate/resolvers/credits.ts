// Credit item for each survey team member

import { getEntity } from '../../load/entities'
import { RequestContext } from '../../types'

/*

Credit

*/
export const creditResolverMap = {
    entity: async ({ id }: { id: string }, {}, context: RequestContext) =>
        await getEntity({ id, context })
}
