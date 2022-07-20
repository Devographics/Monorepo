import { getDynamicResolvers, getOtherKey } from '../helpers'

// we don't want to add ".choices" suffix for graphql_experience as it's a single option question
export default {
    Usage: getDynamicResolvers(id => {
        return id === 'graphql_experience' ? 'usage.graphql_experience' : `usage.${getOtherKey(id)}`
    })
}
