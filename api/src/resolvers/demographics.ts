import { Db } from 'mongodb'
import { SurveyConfig } from '../types'
import { Filters } from '../filters'
import { useCache } from '../caching'
import { computeParticipationByYear } from '../compute'
import { getStaticResolvers } from '../helpers'
import keys from '../data/keys.yml'
import range from 'lodash/range'
import type { Resolvers } from '../generated/graphql'

const computeParticipation = async (
    db: Db,
    survey: SurveyConfig,
    filters?: Filters,
    year?: number
) => useCache(computeParticipationByYear, db, [survey, filters, year])

export const Participation: Resolvers['Participation'] = {
    all_years: (
        { survey, filters },
        args,
        { db }
    ) => computeParticipation(db, survey, filters),
    year: async (
        { survey, filters },
        { year },
        { db }
    ) => {
        const allYears = await computeParticipation(db, survey, filters)
        return allYears.find(y => y.year === year)
    }
}

export const Country: Resolvers['Country'] = getStaticResolvers('user_info.country_alpha3', {
    limit: 999,
    cutoff: 1
})

export const LocaleStats: Resolvers['LocaleStats'] = getStaticResolvers('user_info.locale', {
    limit: 100,
    cutoff: 1
})

export const Source: Resolvers['Source'] = getStaticResolvers('user_info.source.normalized')

export const Gender: Resolvers['Gender'] = getStaticResolvers('user_info.gender', {
    cutoff: 1,
    keys: keys.gender
})

export const RaceEthnicity: Resolvers['RaceEthnicity'] = getStaticResolvers('user_info.race_ethnicity.choices', {
    cutoff: 1,
    keys: keys.race_ethnicity
})

export const Age: Resolvers['Age'] = getStaticResolvers('user_info.age', {
    limit: 100,
    cutoff: 1,
    keys: keys.age
})

export const Salary: Resolvers['Salary'] = getStaticResolvers('user_info.yearly_salary', {
    limit: 100,
    cutoff: 1,
    keys: keys.yearly_salary
})

export const CompanySize: Resolvers['CompanySize'] = getStaticResolvers('user_info.company_size', {
    limit: 100,
    cutoff: 1,
    keys: keys.company_size
})

export const WorkExperience: Resolvers['WorkExperience'] = getStaticResolvers('user_info.years_of_experience', {
    limit: 100,
    cutoff: 1,
    keys: keys.years_of_experience
})

export const JobTitle: Resolvers['JobTitle'] = getStaticResolvers('user_info.job_title', {
    cutoff: 1
})

export const IndustrySector: Resolvers['IndustrySector'] = getStaticResolvers('user_info.industry_sector.choices', {
    cutoff: 1
})

export const KnowledgeScore: Resolvers['KnowledgeScore'] = getStaticResolvers('user_info.knowledge_score', {
    limit: 100,
    cutoff: 1,
    keys: range(1, 101).map(k => k.toString())
})

export const HigherEducationDegree: Resolvers['HigherEducationDegree'] = getStaticResolvers('user_info.higher_education_degree', {
    cutoff: 1,
    keys: keys.higher_education_degree
})

export const DisabilityStatus: Resolvers['DisabilityStatus'] = getStaticResolvers('user_info.disability_status.choices', {
    cutoff: 1
})

export const OtherDisabilityStatus: Resolvers['OtherDisabilityStatus'] = getStaticResolvers('user_info.disability_status.others.normalized', {
    cutoff: 1
})
