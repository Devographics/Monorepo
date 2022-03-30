import { getOtherKey } from '../helpers'
import { getDynamicResolvers } from '../helpers'
import type { Resolvers } from '../generated/graphql'

// minimal cutoff because we don't have many
// freeform extra choices for now (others).
// it's used more to check the volume of data
// rather than actually using it.
export const Environments: Resolvers['Environments'] = getDynamicResolvers(id => `environments.${getOtherKey(id)}`, {
    cutoff: 0
})

export const EnvironmentsRatings: Resolvers['EnvironmentsRatings'] = getDynamicResolvers(id => `environments.${id}`, {
    cutoff: 0
})
