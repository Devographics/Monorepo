import { getDynamicResolvers, getOtherKey } from '../helpers'
import { computeOpinionByYear } from '../compute/opinions'
import { useCache } from '../caching'
import { RequestContext, SurveyConfig } from '../types'
import { Filters } from '../filters'
import { YearAggregations } from '../compute/generic'
import keys from '../data/keys.yml'

interface OpinionConfig {
    survey: SurveyConfig
    id: string
    filters?: Filters
}

export default {
    Opinion: {
        keys: () => keys.opinions,
        all_years: async (
            { survey, id, filters }: OpinionConfig,
            args: any,
            context: RequestContext
        ) =>
            useCache({ func: computeOpinionByYear, context, funcOptions: { survey, id, filters } }),
        year: async (
            { survey, id, filters }: OpinionConfig,
            { year }: { year: number },
            context: RequestContext
        ) => {
            const allYears = await useCache({
                func: computeOpinionByYear,
                context,
                funcOptions: { survey, id, filters }
            })
            return allYears.find((yearItem: YearAggregations) => yearItem.year === year)
        }
    },
    // OtherOpinions: getDynamicResolvers(id => `opinions_others.${id}.others.normalized`, {
    //     sort: { property: 'id', order: 'asc' }
    // }),
    OtherOpinions: getDynamicResolvers(id => `opinions.${getOtherKey(id)}`)
}
