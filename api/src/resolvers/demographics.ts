import { Db } from 'mongodb'
import { RequestContext, SurveyConfig, ResolverStaticConfig } from '../types'
import { Filters } from '../filters'
import { useCache } from '../caching'
import { computeParticipationByYear } from '../compute'
import { getStaticResolvers } from '../helpers'
import keys from '../data/keys.yml'
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

    Country: getStaticResolvers('user_info.country_alpha3', {
        limit: 999,
        cutoff: 1
    }),

    LocaleStats: getStaticResolvers('user_info.locale', {
        limit: 100,
        cutoff: 1
    }),

    CompletionStats: getStaticResolvers('user_info.completion', {
        limit: 100,
        cutoff: 1,
        keys: [...Array(100)].map((a, b) => (b + 1).toString()) // numbers from 1 to 100
    }),
    Source: getStaticResolvers('user_info.source.normalized'),

    Gender: getStaticResolvers('user_info.gender.choices', { cutoff: 1, keys: keys.gender }),

    RaceEthnicity: getStaticResolvers('user_info.race_ethnicity.choices', {
        cutoff: 1,
        keys: keys.race_ethnicity
    }),

    Age: getStaticResolvers('user_info.age.choices', { limit: 100, cutoff: 1, keys: keys.age }),

    Salary: getStaticResolvers('user_info.yearly_salary.choices', {
        limit: 100,
        cutoff: 1,
        keys: keys.yearly_salary
    }),

    CompanySize: getStaticResolvers('user_info.company_size.choices', {
        limit: 100,
        cutoff: 1,
        keys: keys.company_size
    }),

    WorkExperience: getStaticResolvers('user_info.years_of_experience.choices', {
        limit: 100,
        cutoff: 1,
        keys: keys.years_of_experience
    }),

    JobTitle: getStaticResolvers('user_info.job_title.choices', {
        cutoff: 1
    }),

    IndustrySector: getStaticResolvers('user_info.industry_sector.choices', {
        cutoff: 1
    }),

    KnowledgeScore: getStaticResolvers('user_info.knowledge_score', {
        limit: 100,
        cutoff: 1,
        keys: range(1, 101).map(k => k.toString())
    }),

    HigherEducationDegree: getStaticResolvers('user_info.higher_education_degree.choices', {
        cutoff: 1,
        keys: keys.higher_education_degree
    }),

    DisabilityStatus: getStaticResolvers('user_info.disability_status.choices', {
        cutoff: 1
    }),

    OtherDisabilityStatus: getStaticResolvers('user_info.disability_status.others.normalized', {
        cutoff: 1
    })
}
