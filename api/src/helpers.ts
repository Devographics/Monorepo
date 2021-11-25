import { EnumTypeDefinitionNode } from 'graphql'
import typeDefs from './type_defs/schema.graphql'
// import allEntities from './data/entities/index'
import { RequestContext, ResolverDynamicConfig, SurveyConfig } from './types'
import {
    computeTermAggregationAllYearsWithCache,
    computeTermAggregationSingleYearWithCache
} from './compute'
import { Filters } from './filters'
import { Options } from './options'
import { Facet } from './facets'
import { loadOrGetEntities } from './entities'
import { TermAggregationOptions, AggregationFunction } from './compute/generic'

/**
 * Return either e.g. other_tools.browsers.choices or other_tools.browsers.others_normalized
 */
export const getOtherKey = (id: string) =>
    id.includes('_others') ? `${id.replace('_others', '')}.others.normalized` : `${id}.choices`

export const getGraphQLEnumValues = (name: string): string[] => {
    const enumDef = typeDefs.definitions.find(def => {
        return def.kind === 'EnumTypeDefinition' && def.name.value === name
    }) as EnumTypeDefinitionNode

    if (enumDef === undefined) {
        throw new Error(`No enum found matching name: ${name}`)
    }

    return enumDef.values!.map(v => v.name.value)
}

/**
 * Get resolvers when the db key is the same as the field id
 *
 * @param id the field's GraphQL id
 * @param options options
 */
export const getStaticResolvers = (
    id: string,
    options: TermAggregationOptions = {},
    aggregationFunction?: AggregationFunction
) => ({
    keys: async () => options.keys || [],
    all_years: async (
        { survey, filters, options: queryOptions, facet }: ResolverDynamicConfig,
        args: any,
        { db }: RequestContext
    ) =>
        computeTermAggregationAllYearsWithCache(
            db,
            survey,
            id,
            { ...options, ...queryOptions, filters, facet },
            aggregationFunction
        ),
    year: async (
        { survey, filters, options: queryOptions, facet }: ResolverDynamicConfig,
        { year }: { year: number },
        { db }: RequestContext
    ) =>
        computeTermAggregationSingleYearWithCache(
            db,
            survey,
            id,
            { ...options, ...queryOptions, filters, year, facet },
            aggregationFunction
        )
})

/**
 * Get resolvers when the db key is *not* the same as the field id
 *
 * @param getId a function that takes the field's GraphQL id and returns the db key
 * @param options options
 */
export const getDynamicResolvers = (
    getId: (id: string) => string,
    options: TermAggregationOptions = {},
    aggregationFunction?: AggregationFunction
) => ({
    all_years: async (
        { survey, id, filters, options: queryOptions, facet }: ResolverDynamicConfig,
        args: any,
        { db }: RequestContext
    ) =>
        computeTermAggregationAllYearsWithCache(
            db,
            survey,
            getId(id),
            { ...options, ...queryOptions, filters, facet },
            aggregationFunction
        ),
    year: async (
        { survey, id, filters, options: queryOptions, facet }: ResolverDynamicConfig,
        { year }: { year: number },
        { db }: RequestContext
    ) =>
        computeTermAggregationSingleYearWithCache(
            db,
            survey,
            getId(id),
            {
                ...options,
                ...queryOptions,
                filters,
                facet,
                year
            },
            aggregationFunction
        )
})

const demographicsFields = [
    'age',
    'country',
    'locale',
    'source',
    'gender',
    'race_ethnicity',
    'yearly_salary',
    'company_size',
    'years_of_experience',
    'job_title',
    'industry_sector',
    'industry_sector_others',
    'knowledge_score',
    'higher_education_degree',
    'disability_status',
    'disability_status_others'
]

/**
 * Generic resolvers for passing down arguments for demographic fields
 *
 * @param survey current survey
 */
export const getDemographicsResolvers = (survey: SurveyConfig) => {
    const resolvers: any = {}
    demographicsFields.forEach(field => {
        resolvers[field] = ({
            filters,
            options,
            facet
        }: {
            filters: Filters
            options: Options
            facet: Facet
        }) => ({
            survey,
            filters,
            options,
            facet
        })
    })
    return resolvers
}
