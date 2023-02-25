// import { EnumTypeDefinitionNode } from 'graphql'
// import typeDefs from './type_defs/schema.graphql'
// // import allEntities from './data/entities/index'
// import { RequestContext, ResolverDynamicConfig, SurveyConfig, Facet } from './types'
// import {
//     computeTermAggregationAllYearsWithCache,
//     computeTermAggregationSingleYearWithCache
// } from './compute'
// import { Filters } from './filters'
// import { Options } from './options'
// import { loadOrGetEntities } from './entities'
// import { TermAggregationOptions, AggregationFunction } from './compute/generic'
import yamlKeys from './data/keys.yml'

export const getAllKeys = () => {
    const keys = {}
    for (let k in yamlKeys) {
        keys[k] = yamlKeys[k].map(k => (typeof k === 'object' ? k.id : k))
    }
    return keys
}

export const getChartKeys = (field: string) => {
    return getAllKeys()[field]
}

// /**
//  * Return either e.g. other_tools.browsers.choices or other_tools.browsers.others.normalized
//  */
// // TODO: find less brittle/more systematized way to do this
// export const getOtherKey = (id: string) => {
//     let key
//     if (id.includes('_others')) {
//         key = `${id.replace('_others', '')}.others.normalized`
//     } else if (id.includes('_freeform')) {
//         key = `${id}.others.normalized`
//     } else {
//         key = `${id}.choices`
//     }
//     return key
// }

// export const getGraphQLEnumValues = (name: string): string[] => {
//     const enumDef = typeDefs.definitions.find(def => {
//         return def.kind === 'EnumTypeDefinition' && def.name.value === name
//     }) as EnumTypeDefinitionNode

//     if (enumDef === undefined) {
//         throw new Error(`No enum found matching name: ${name}`)
//     }

//     return enumDef.values!.map(v => v.name.value)
// }

// interface DemographicsResolverConfig extends ResolverDynamicConfig {
//     fieldName: string
// }
// /**
//  * Get resolvers when the db key is the same as the field id
//  *
//  * @param id the field's GraphQL id
//  * @param options options
//  */
// export const getDemographicsResolverFunctions = (
//     options: TermAggregationOptions = {},
//     aggregationFunction?: AggregationFunction
// ) => ({
//     keys: async () => options.keys || [],
//     all_years: async (
//         { fieldName, survey, filters, options: queryOptions, facet }: DemographicsResolverConfig,
//         args: any,
//         context: RequestContext
//     ) =>
//         computeTermAggregationAllYearsWithCache({
//             context,
//             survey,
//             key: getDemographicsFieldPath(fieldName),
//             options: { ...options, ...queryOptions, filters, facet },
//             aggregationFunction
//         }),
//     year: async (
//         { fieldName, survey, filters, options: queryOptions, facet }: DemographicsResolverConfig,
//         { year }: { year: number },
//         context: RequestContext
//     ) =>
//         computeTermAggregationSingleYearWithCache({
//             context,
//             survey,
//             key: getDemographicsFieldPath(fieldName),
//             options: { ...options, ...queryOptions, filters, year, facet },
//             aggregationFunction
//         })
// })

// /**
//  * Get resolvers when the db key is *not* the same as the field id
//  *
//  * @param getId a function that takes the field's GraphQL id and returns the db key
//  * @param options options
//  */
// export const getDynamicResolvers = (
//     getId: (id: string) => string,
//     options: TermAggregationOptions = {},
//     aggregationFunction?: AggregationFunction
// ) => ({
//     all_years: async (
//         { survey, id, filters, options: queryOptions, facet }: ResolverDynamicConfig,
//         args: any,
//         context: RequestContext
//     ) =>
//         computeTermAggregationAllYearsWithCache({
//             context,
//             survey,
//             key: getId(id),
//             options: { ...options, ...queryOptions, filters, facet },
//             aggregationFunction
//         }),
//     year: async (
//         { survey, id, filters, options: queryOptions, facet }: ResolverDynamicConfig,
//         { year }: { year: number },
//         context: RequestContext
//     ) =>
//         computeTermAggregationSingleYearWithCache({
//             context,
//             survey,
//             key: getId(id),
//             options: {
//                 ...options,
//                 ...queryOptions,
//                 filters,
//                 facet,
//                 year
//             },
//             aggregationFunction
//         })
// })

// export const getDynamicResolversWithKeys = (
//     getId: (id: string) => string,
//     options: TermAggregationOptions = {},
//     aggregationFunction?: AggregationFunction
// ) => {
//     const keysFunction = async ({ id }: ResolverDynamicConfig) => {
//         return getChartKeys(id) || []
//     }
//     return {
//         keys: keysFunction,
//         ...getDynamicResolvers(getId, { ...options, keysFunction }, aggregationFunction)
//     }
// }

// const demographicsFields = [
//     'age',
//     'country',
//     'locale',
//     'completion_stats',
//     'source',
//     'gender',
//     'race_ethnicity',
//     'yearly_salary',
//     'company_size',
//     'years_of_experience',
//     'job_title',
//     'industry_sector',
//     'industry_sector_others',
//     'knowledge_score',
//     'higher_education_degree',
//     'disability_status',
//     'disability_status_others'
// ]

// /**
//  * Generic resolvers for passing down arguments for demographic fields
//  *
//  * @param survey current survey
//  */
// export const getDemographicsResolvers = (survey: SurveyConfig) => {
//     const resolvers: any = {}
//     demographicsFields.forEach(field => {
//         resolvers[field] = (
//             args: { filters: Filters; parameters: Parameters; facet: Facet },
//             context: RequestContext,
//             info: any
//         ) => {
//             const { fieldName } = info
//             const { filters, options, facet } = args
//             return {
//                 fieldName,
//                 survey,
//                 filters,
//                 options,
//                 facet
//             }
//         }
//     })
//     return resolvers
// }

export const getFacetSegments = (facet: string) => {
    const [sectionName, fieldName] = facet?.includes('/')
        ? facet.split('/')
        : ['demographics', facet]
    return { sectionName, fieldName }
}

export const getFacetPath = (facet: string) => {
    // if facet contains "/" assume it's of the format "section/field"
    // else default to treating it as a demographics facet
    const { sectionName, fieldName } = getFacetSegments(facet)
    switch (sectionName) {
        case 'demographics':
            return getDemographicsFieldPath(fieldName)
        case 'features':
        case 'tools':
            return `${sectionName}.${fieldName}.experience`
        case 'resources':
        case 'tools_others':
        default:
            return `${sectionName}.${fieldName}.choices`
    }
}

// export const getFacetKeys = (facet: string) => {
//     let keys
//     const { sectionName, fieldName } = getFacetSegments(facet)
//     switch (sectionName) {
//         case 'features':
//             keys = getChartKeys('feature')
//             break

//         case 'tools':
//             keys = getChartKeys('tool')
//             break

//         default:
//             keys = getChartKeys(fieldName)
//             break
//     }
//     return keys
// }

export const getDemographicsFacetPath = (facet: string) => {
    switch (facet) {
        case 'source':
            return 'source.normalized'
        case 'country':
            return 'country_alpha3'
        case 'completion_stats':
            return 'completion'
        case 'locale':
            return 'locale'
        case 'knowledge_score':
            return 'knowledge_score'
        case 'disability_status_others':
            return 'disability_status.others.normalized'
        case 'industry_sector_others':
            return 'industry_sector.others.normalized'
        default:
            return `${facet}.choices`
    }
}

export const getDemographicsFieldPath = (fieldName: string) =>
    `user_info.${getDemographicsFacetPath(fieldName)}`
