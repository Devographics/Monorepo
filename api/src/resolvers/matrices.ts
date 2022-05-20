import { useCache } from '../caching'
import { computeToolsMatrix } from '../compute'
import type { Resolvers } from '../generated/graphql'

export const Matrices: Resolvers['Matrices'] = {
    async tools(
        { survey },
        {
            year,
            ids,
            experiences,
            dimensions
        },
        { db }
    ) {
        const result = []
        for (const experience of experiences) {
            const by_dimension = []
            for (const dimension of dimensions) {
                const tools = await useCache(computeToolsMatrix, db, [
                    {
                        survey,
                        tools: ids,
                        experience,
                        type: dimension,
                        year
                    }
                ])

                by_dimension.push({
                    dimension,
                    tools
                })
            }

            result.push({
                experience,
                dimensions: by_dimension
            })
        }

        return result
    }
}
