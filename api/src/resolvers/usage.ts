import { getDynamicResolversWithKeys, getOtherKey } from '../helpers'

export default {
    Usage: getDynamicResolversWithKeys(id => `usage.${getOtherKey(id)}`)
}