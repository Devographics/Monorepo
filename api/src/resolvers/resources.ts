import { getDynamicResolvers, getOtherKey } from '../helpers'
import type { Resolvers } from '../generated/graphql'

export const Resources: Resolvers['Resources'] = getDynamicResolvers(id => `resources.${getOtherKey(id)}`)
