import { getDynamicResolvers, getOtherKey } from '../helpers'
import type { Resolvers } from '../generated/graphql'

export const OtherTools: Resolvers['OtherTools'] = getDynamicResolvers(id => `tools_others.${getOtherKey(id)}`)

