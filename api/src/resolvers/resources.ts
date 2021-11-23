import { getDynamicResolvers, getOtherKey } from '../helpers'

export default {
    Resources: getDynamicResolvers(id => `resources.${getOtherKey(id)}`)
}