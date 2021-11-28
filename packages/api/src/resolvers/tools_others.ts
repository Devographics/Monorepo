import { getDynamicResolvers, getOtherKey } from '../helpers'

export default {
    OtherTools: getDynamicResolvers(id => `tools_others.${getOtherKey(id)}`)
}
