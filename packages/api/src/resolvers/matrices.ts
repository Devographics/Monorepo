import { useCache } from '../caching'
import { computeToolsMatrix, ToolExperienceFilterId } from '../compute'
import { SurveyConfig, RequestContext } from '../types'

export default {
    Matrices: {
        tools: async (
            { survey }: { survey: SurveyConfig },
            {
                year,
                ids,
                experiences,
                dimensions,
            }: {
                year: number
                ids: string[]
                experiences: ToolExperienceFilterId[]
                dimensions: string[]
            },
            { db }: RequestContext
        ) => {
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
                            year,
                        }
                    ])

                    by_dimension.push({
                        dimension,
                        tools,
                    })
                }

                result.push({
                    experience,
                    dimensions: by_dimension,
                })
            }

            return result
        }
    }
}
