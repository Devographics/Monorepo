import { getGraphQLEnumValues, getDemographicsResolvers } from '../helpers'
import { getEntity } from '../entities'
import { RequestContext, SurveyConfig, Facet } from '../types'
import { Filters } from '../filters'
import { Options } from '../options'
import {
    computeToolExperienceGraph,
    computeToolExperienceTransitions,
    computeToolsCardinalityByUser,
    ToolExperienceId
} from '../compute'
import { useCache } from '../caching'

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
export default {
    Survey: {
        surveyName: (survey: SurveyConfig) => {
            return survey.survey
        },
        bracket_wins: (survey: SurveyConfig, args: ResolverArguments) => ({
            survey,
            ...args
        }),
        bracket_matchups: (survey: SurveyConfig, args: ResolverArguments) => ({
            survey,
            ...args
        }),
        category: (survey: SurveyConfig, { id }: { id: string }) => ({
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
        demographics: (survey: SurveyConfig) => ({
            participation: { survey },
            ...getDemographicsResolvers(survey)
        }),
        environments: (survey: SurveyConfig, args: ResolverArguments) => ({
            survey,
            ...args
        }),
        environments_ratings: (survey: SurveyConfig, args: ResolverArguments) => ({
            survey,
            ...args
        }),
        feature: (survey: SurveyConfig, { id }: { id: string }) => ({
            survey,
            id,
            experience: ({ filters }: { filters?: Filters }) => ({
                survey,
                id,
                filters
            }),
            comments: ({ filters }: { filters?: Filters }) => ({
                survey,
                id,
                filters
            })
        }),
        features: (survey: SurveyConfig, { ids = featureIds }: { ids: string[] }) =>
            ids.map(id => ({
                survey,
                id,
                experience: ({ filters }: { filters?: Filters }) => ({
                    survey,
                    id,
                    filters
                })
            })),
        features_others: (
            survey: SurveyConfig,
            { id, filters }: { id: string; filters?: Filters }
        ) => ({
            survey,
            id,
            filters
        }),
        happiness: (survey: SurveyConfig, args: ResolverArguments) => ({
            survey,
            ...args
        }),
        matrices: (survey: SurveyConfig) => ({
            survey
        }),
        opinion: (survey: SurveyConfig, args: ResolverArguments) => ({
            survey,
            ...args
        }),
        opinions_others: (survey: SurveyConfig, args: ResolverArguments) => ({
            survey,
            ...args
        }),
        proficiency: (survey: SurveyConfig, args: ResolverArguments) => ({
            survey,
            ...args
        }),
        resources: (survey: SurveyConfig, args: ResolverArguments) => ({
            survey,
            ...args
        }),
        usage: (survey: SurveyConfig, args: ResolverArguments) => ({
            survey,
            ...args
        }),
        tool: async (survey: SurveyConfig, { id }: { id: string }) => ({
            survey,
            id,
            entity: await getEntity({ id }),
            experience: (args: ResolverArguments) => ({
                survey,
                id,
                ...args
            }),
            experienceGraph: async ({ filters }: { filters?: Filters }, context: RequestContext) =>
                useCache({
                    func: computeToolExperienceGraph,
                    context,
                    funcOptions: { survey, id, filters }
                }),
            comments: ({ filters }: { filters?: Filters }) => ({
                survey,
                id,
                filters
            })
        }),
        tools: async (survey: SurveyConfig, { ids = toolIds }: { ids?: string[] }) =>
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
                    context: RequestContext
                ) =>
                    useCache({
                        func: computeToolExperienceTransitions,
                        context,
                        funcOptions: { survey, id, years: [year - 1, year] }
                    }),
                experienceGraph: async (
                    { filters }: { filters?: Filters },
                    context: RequestContext
                ) =>
                    useCache({
                        func: computeToolExperienceGraph,
                        context,
                        funcOptions: { survey, id, filters }
                    })
            })),
        tools_cardinality_by_user: (
            survey: SurveyConfig,
            {
                year,
                // tool IDs
                ids,
                experienceId
            }: {
                year: number
                ids: string[]
                experienceId: ToolExperienceId
            },
            context: RequestContext
        ) =>
            useCache({
                func: computeToolsCardinalityByUser,
                context,
                funcOptions: { survey, year, toolIds: ids, experienceId }
            }),
        tools_others: (survey: SurveyConfig, args: ResolverArguments) => ({
            survey,
            ...args
        }),
        tools_rankings: (
            survey: SurveyConfig,
            { ids, filters }: { ids: string[]; filters: Filters }
        ) => ({
            survey,
            ids,
            filters
        }),
        totals: (survey: SurveyConfig) => survey,
        explorer: (survey: SurveyConfig, args: ResolverArguments) => ({
            survey,
            ...args
        }),
    },
    SurveyCreditsItem: {
        entity: async ({ id }: { id: string }) => await getEntity({ id })
    }
}
