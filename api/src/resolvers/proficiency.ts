import { getDynamicResolvers } from '../helpers'
import { Resolvers } from '../generated/graphql'

export const Proficiency: Resolvers['Proficiency'] = getDynamicResolvers(id => `user_info.${id}`)
