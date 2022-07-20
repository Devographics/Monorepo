import { getDynamicResolvers, getOtherKey } from '../helpers'

// we don't want to add ".choices" suffix for single-option questions
const singleOptionQuestions = ['graphql_experience', 'code_generation_type']

export default {
    Usage: getDynamicResolvers(id => {
        return singleOptionQuestions.includes(id) ? `usage.${id}` : `usage.${getOtherKey(id)}`
    })
}
