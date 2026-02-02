import { getRawCommentsWithCache } from '../../compute/comments'
import { ResolverMap } from '../../types'

/*

Comments

*/
export const commentsResolverMap: ResolverMap = {
    allEditions: async ({ survey, question }, args, context) =>
        await getRawCommentsWithCache({
            survey,
            question,
            context,
            args
        }),
    currentEdition: async ({ survey, edition, question, args }, args2, context) =>
        await getRawCommentsWithCache({
            survey,
            question,
            editionId: edition.id,
            context,
            args
        })
}
