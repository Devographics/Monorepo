import { Db } from 'mongodb'
import { computeHappinessByYear, computeTermAggregationAllYears } from '../compute'
import { useCache } from '../caching'
import { RequestContext, SurveyConfig } from '../types'
import { Filters } from '../filters'
import { YearAggregations } from '../compute/generic'

interface CategoryConfig {
    survey: SurveyConfig
    id: string
    filters?: Filters
}

const computeOtherTools = async (context: RequestContext, survey: SurveyConfig, id: string, filters?: Filters) =>
    useCache(computeTermAggregationAllYears, context, [
        survey,
        `tools_others.${id}.others.normalized`,
        { filters }
    ])

export default {
    CategoryOtherTools: {
        all_years: async (
            { survey, id, filters }: CategoryConfig,
            args: any,
            context: RequestContext
        ) => computeOtherTools(context, survey, id, filters),
        year: async (
            { survey, id, filters }: CategoryConfig,
            { year }: { year: number },
            context: RequestContext
        ) => {
            const allYears = await computeOtherTools(context, survey, id, filters)
            return allYears.find((yearItem: YearAggregations) => yearItem.year === year)
        }
    },
    CategoryHappiness: {
        all_years: async (
            { survey, id, filters }: CategoryConfig,
            args: any,
            context: RequestContext
        ) => useCache(computeHappinessByYear, context, [survey, id, filters]),
        year: async (
            { survey, id, filters }: CategoryConfig,
            { year }: { year: number },
            context: RequestContext
        ) => {
            const allYears = await useCache(computeHappinessByYear, context, [survey, id, filters])
            return allYears.find((yearItem: YearAggregations) => yearItem.year === year)
        }
    }
}
