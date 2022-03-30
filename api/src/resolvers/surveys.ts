import { getGraphQLEnumValues, getDemographicsResolvers } from '../helpers'
import { getEntity } from '../entities'
import { RequestContext } from '../types'
import { Filters } from '../filters'
import { Options } from '../options'
import { Facet } from '../facets'
import {
    computeToolExperienceGraph,
    computeToolExperienceTransitions,
    computeToolsCardinalityByUser
} from '../compute'
import { useCache } from '../caching'
import type { Resolvers } from '../generated/graphql'

const toolIds = getGraphQLEnumValues('ToolID')
const featureIds = getGraphQLEnumValues('FeatureID')

export interface ResolverArguments {
    id?: string
    filters?: Filters
    options?: Options
    facet?: Facet
}

/**
 * Please maintain the same order as the one shown in the explorer,
 * it makes it easier to find a specific query and ensures consistency.
 */
export const Survey: Resolvers['Survey'] = {
    surveyName: (survey) => {
        return survey.survey
    },
    bracket_wins: (survey, args) => ({
        survey,
        ...args
    }),
    bracket_matchups: (survey, args) => ({
        survey,
        ...args
    }),
    category: (survey, { id }) => ({
        survey,
        id,
        happiness: ({ filters }: { filters: Filters }) => ({
            survey,
            id,
            filters
        }),
        otherTools: ({ filters }: { filters: Filters }) => ({
            survey,
            id,
            filters
        })
    }),
    demographics: (survey) => ({
        participation: { survey },
        ...getDemographicsResolvers(survey)
    }),
    environments: (survey, args) => ({
        survey,
        ...args
    }),
    environments_ratings: (survey, args) => ({
        survey,
        ...args
    }),
    feature: (survey, { id }) => ({
        survey,
        id,
        experience: ({ filters }: { filters?: Filters }) => ({
            survey,
            id,
            filters
        })
    }),
    features: (survey, { ids = featureIds }) =>
        ids.map(id => ({
            survey,
            id,
            experience: ({ filters }: { filters?: Filters }) => ({
                survey,
                id,
                filters
            })
        })),
    features_others: (survey, { id, filters }) => ({
        survey,
        id,
        filters
    }),
    happiness: (survey, args) => ({
        survey,
        ...args
    }),
    matrices: (survey) => ({
        survey
    }),
    opinion: (survey, args) => ({
        survey,
        ...args
    }),
    opinions_others: (survey, args) => ({
        survey,
        ...args
    }),
    proficiency: (survey, args) => ({
        survey,
        ...args
    }),
    resources: (survey, args) => ({
        survey,
        ...args
    }),
    tool: async (survey, { id }) => ({
        survey,
        id,
        entity: await getEntity({ id }),
        experience: (args: ResolverArguments) => ({
            survey,
            id,
            ...args
        }),
        experienceGraph: async ({ filters }: { filters?: Filters }, { db }: RequestContext) =>
            useCache(computeToolExperienceGraph, db, [survey, id, filters])
    }),
    tools: async (survey, { ids = toolIds }) =>
        ids.map(async id => ({
            survey,
            id,
            entity: await getEntity({ id }),
            experience: (args: ResolverArguments) => ({
                survey,
                id,
                ...args
            }),
            experienceAggregated: (args: ResolverArguments) => ({
                survey,
                id,
                ...args
            }),
            experienceTransitions: async (
                { year }: { year: number },
                { db }: RequestContext
            ) => useCache(computeToolExperienceTransitions, db, [survey, id, [year - 1, year]]),
            experienceGraph: async (
                { filters }: { filters?: Filters },
                { db }: RequestContext
            ) => useCache(computeToolExperienceGraph, db, [survey, id, filters])
        })),
    tools_cardinality_by_user: (
        survey,
        {
            year,
            // tool IDs
            ids,
            experienceId
        },
        context
    ) => useCache(computeToolsCardinalityByUser, context.db, [survey, year, ids, experienceId]),
    tools_others: (survey, args) => ({
        survey,
        ...args
    }),
    tools_rankings: (survey, { ids, filters }) => ({
        survey,
        ids,
        filters
    }),
    totals: (survey) => survey
}
