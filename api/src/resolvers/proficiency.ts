import { getDynamicResolvers } from '../helpers'

export default {
    Proficiency: getDynamicResolvers(id => `user_info.${id}`)
}
