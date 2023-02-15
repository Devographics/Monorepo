import { Db } from 'mongodb'
import { RequestContext, SurveyConfig, ResolverStaticConfig } from '../types'
import { Filters } from '../filters'
import { useCache } from '../caching'
import { computeParticipationByYear } from '../compute'
import { getDemographicsResolverFunctions } from '../helpers'
import { getChartKeys } from '../helpers'
import range from 'lodash/range.js'

const computeParticipation = async (
    context: RequestContext,
    survey: SurveyConfig,
    filters?: Filters,
    year?: number
) => useCache({ func: computeParticipationByYear, context, funcOptions: { survey, filters, year } })

export default {
    Participation: {
        all_years: async (
            { survey, filters }: ResolverStaticConfig,
            args: any,
            context: RequestContext
        ) => computeParticipation(context, survey, filters),
        year: async (
            { survey, filters }: ResolverStaticConfig,
            { year }: { year: number },
            context: RequestContext
        ) => {
            const allYears = await computeParticipation(context, survey, filters)
            return allYears.find(y => y.year === year)
        }
    },

    Country: getDemographicsResolverFunctions({
        limit: 999,
        cutoff: 1
    }),

    LocaleStats: getDemographicsResolverFunctions({
        limit: 100,
        cutoff: 1
    }),

    CompletionStats: getDemographicsResolverFunctions({
        limit: 100,
        cutoff: 1,
        keys: [...Array(100)].map((a, b) => (b + 1).toString()) // numbers from 1 to 100
    }),
    Source: getDemographicsResolverFunctions(),

    Gender: getDemographicsResolverFunctions({ cutoff: 1, keys: getChartKeys('gender') }),

    RaceEthnicity: getDemographicsResolverFunctions({
        cutoff: 1,
        keys: getChartKeys('race_ethnicity')
    }),

    Age: getDemographicsResolverFunctions({ limit: 100, cutoff: 1, keys: getChartKeys('age') }),

    Salary: getDemographicsResolverFunctions({
        limit: 100,
        cutoff: 1,
        keys: getChartKeys('yearly_salary')
    }),

    CompanySize: getDemographicsResolverFunctions({
        limit: 100,
        cutoff: 1,
        keys: getChartKeys('company_size')
    }),

    WorkExperience: getDemographicsResolverFunctions({
        limit: 100,
        cutoff: 1,
        keys: getChartKeys('years_of_experience')
    }),

    JobTitle: getDemographicsResolverFunctions({
        cutoff: 1
    }),

    IndustrySector: getDemographicsResolverFunctions({
        cutoff: 1
    }),

    KnowledgeScore: getDemographicsResolverFunctions({
        limit: 100,
        cutoff: 1,
        keys: range(1, 101).map(k => k.toString())
    }),

    HigherEducationDegree: getDemographicsResolverFunctions({
        cutoff: 1,
        keys: getChartKeys('higher_education_degree')
    }),

    DisabilityStatus: getDemographicsResolverFunctions({
        cutoff: 1
    }),

    OtherDisabilityStatus: getDemographicsResolverFunctions({
        cutoff: 1
    })
}
