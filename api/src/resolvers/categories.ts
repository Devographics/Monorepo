import { Db } from 'mongodb'
import { computeHappinessByYear, computeTermAggregationAllYears } from '../compute'
import { useCache } from '../caching'
import { SurveyConfig } from '../types'
import { Filters } from '../filters'
import { YearAggregations } from '../compute'
import type { Resolvers } from '../generated/graphql'

interface CategoryConfig {
    survey: SurveyConfig
    id: string
    filters?: Filters
}

const computeOtherTools = async (db: Db, survey: SurveyConfig, id: string, filters?: Filters) =>
    useCache(computeTermAggregationAllYears, db, [
        survey,
        `tools_others.${id}.others.normalized`,
        { filters }
    ])


export const CategoryOtherTools: Resolvers['CategoryOtherTools'] = {
    all_years: (
        { survey, id, filters },
        args,
        { db }
    ) => computeOtherTools(db, survey, id, filters),
    year: async (
        { survey, id, filters },
        { year },
        { db }
    ) => {
        const allYears = await computeOtherTools(db, survey, id, filters)
        return allYears.find((yearItem: YearAggregations) => yearItem.year === year)
    }
}

export const CategoryHappiness: Resolvers['CategoryHappiness'] = {
    all_years: (
        { survey, id, filters },
        args,
        { db }
    ) => useCache(computeHappinessByYear, db, [survey, id, filters]),
    year: async (
        { survey, id, filters },
        { year },
        { db }
    ) => {
        const allYears = await useCache(computeHappinessByYear, db, [survey, id, filters])
        return allYears.find((yearItem: YearAggregations) => yearItem.year === year)
    }
}
