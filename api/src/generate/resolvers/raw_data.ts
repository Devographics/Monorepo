import { calculateWordFrequencies } from '@devographics/helpers'
import take from 'lodash/take.js'
import uniqBy from 'lodash/uniqBy.js'
import sortBy from 'lodash/sortBy.js'
import { getRawData } from '../../compute/raw'
import { getEntities } from '../../load/entities'
import { ResolverType } from '../../types'

export const rawDataResolver: ResolverType = async (parent, args, context, info) => {
    console.log('// rawDataResolver')
    const { survey, edition, section, question, responseArguments } = parent
    const { token } = args
    const { parameters } = responseArguments || {}
    const { limit } = parameters || {}

    // helper function to get count of how many times a token appears across all answers
    const getTokenCount = (tokenId: string) =>
        answers?.filter(a => a.tokens && a.tokens.map(t => t.id).includes(tokenId)).length

    // get all raw answers for this question
    let answers = await getRawData({ survey, edition, section, question, context, token })

    if (limit) {
        answers = take(answers, limit)
    }

    // get word frequency stats
    const stats = answers && calculateWordFrequencies(answers.map(item => item.raw))

    // get all entities available, including tokens
    const allEntities = await getEntities({ context, includeNormalizationEntities: true })

    // get full list of all tokens ids for all answers to the question
    const allAnswerTokens =
        answers &&
        answers
            .filter(answer => !!answer.tokens)
            .map(answer => answer.tokens)
            .flat()

    // deduplicate tokens
    const answerTokens = uniqBy(allAnswerTokens, token => token.id)
    const answerTokensIds = answerTokens?.map(token => token.id)

    // decorate tokens with matching entity data to also get parentId, name, description, etc.
    const fullAnswerTokens = answerTokens.map(token => {
        const entity = allEntities.find(e => e.id === token.id)
        return { ...token, ...entity }
    })

    // add counts
    const answerTokensWithCounts = fullAnswerTokens?.map(token => ({
        ...token,
        count: getTokenCount(token.id)
    }))
    // sort and reverse
    const tokens = sortBy(answerTokensWithCounts, 'count').toReversed()

    const entities = allEntities.filter(entity => answerTokensIds?.includes(entity.id))

    return { answers, stats, entities, tokens }
}
