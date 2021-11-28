import { getOtherKey } from '../helpers'
import { getDynamicResolvers } from '../helpers'

export default {
    // minimal cutoff because we don't have many
    // freeform extra choices for now (others).
    // it's used more to check the volume of data
    // rather than actually using it.
    Environments: getDynamicResolvers(id => `environments.${getOtherKey(id)}`, {
        cutoff: 0
    }),

    EnvironmentsRatings: getDynamicResolvers(id => `environments.${id}`, {
        cutoff: 0
    })
}
