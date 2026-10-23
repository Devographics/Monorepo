import { z } from 'zod'
// type-only: Gatsby leaves @devographics/types external in the compiled gatsby-node.js,
// and Node can't load its .ts source at runtime
import type {
    ChartOptions,
    Filter,
    ResponsesParameters,
    ResultsSitemap,
    ResultsSitemapBlock,
    ResultsSitemapFiltersState,
    ResultsSitemapPage,
    SitemapBlockQueryOptions,
    SortSpecifier
} from '@devographics/types'

/*

Runtime validation for raw_sitemap.yml, mirroring the ResultsSitemap types
in shared/types/sitemap.ts. Each schema is annotated with the type it mirrors
so the two can't drift apart without a type error.

Objects are strict: unknown keys (e.g. typos) are reported as errors.

Enum values are spelled out because only types can be imported from
@devographics/types here; the type annotations reject any invalid value.

*/

const orderSchema = z.enum(['asc', 'desc'])
const unitsSchema = z.enum([
    'count',
    'percentageQuestion',
    'percentageSurvey',
    'percentageBucket',
    'averageByFacet',
    'medianByFacet',
    'percentilesByFacet'
])

const sortSpecifierSchema: z.ZodType<SortSpecifier> = z.strictObject({
    property: z.enum(['options', 'count', 'percent', 'id', 'averageByFacet', 'medianByFacet', 'mean']),
    order: orderSchema.optional()
})

const parametersSchema: z.ZodType<ResponsesParameters> = z.strictObject({
    cutoff: z.number().optional(),
    cutoffPercent: z.number().optional(),
    limit: z.number().optional(),
    sort: sortSpecifierSchema.optional(),
    facetCutoff: z.number().optional(),
    facetCutoffPercent: z.number().optional(),
    facetLimit: z.number().optional(),
    facetSort: sortSpecifierSchema.optional(),
    enableCache: z.boolean().optional(),
    showNoAnswer: z.boolean().optional(),
    showNoMatch: z.boolean().optional(),
    mergeOtherBuckets: z.boolean().optional(),
    enableBucketGroups: z.boolean().optional(),
    enableBucketNesting: z.boolean().optional(),
    enableAddOverallBucket: z.boolean().optional(),
    enableAddMissingBuckets: z.boolean().optional()
})

const queryOptionsSchema: z.ZodType<SitemapBlockQueryOptions> = z.strictObject({
    allEditions: z.boolean().optional(),
    editionsCount: z.number().optional(),
    addBucketsEntities: z.boolean().optional(),
    addQuestionEntity: z.boolean().optional(),
    addQuestionComments: z.boolean().optional(),
    addRatios: z.boolean().optional(),
    addBuckets: z.boolean().optional(),
    addGroupedBuckets: z.boolean().optional(),
    addNestedBuckets: z.boolean().optional(),
    addCorrelations: z.boolean().optional(),
    addCardinalities: z.boolean().optional(),
    enableBucketNesting: z.boolean().optional(),
    sectionId: z.string().optional(),
    questionId: z.string().optional(),
    subField: z.enum(['responses', 'freeform', 'combined', 'prenormalized']).optional()
})

const chartOptionsSchema: z.ZodType<ChartOptions> = z.strictObject({
    limit: z.number().optional(),
    dataFilters: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    defaultMarker: z.enum(['average', 'median']).optional(),
    defaultView: z.string().optional(),
    showTrendLine: z.boolean().optional(),
    grouping: z.string().optional(),
    sort: z.string().optional(),
    order: orderSchema.optional()
})

const facetSchema = z.strictObject({
    id: z.string(),
    sectionId: z.string()
})

const bucketsFilterSchema: z.ZodType<Filter<string>> = z.strictObject({
    eq: z.string().optional(),
    in: z.array(z.string()).optional(),
    nin: z.array(z.string()).optional(),
    lt: z.string().optional(),
    gt: z.string().optional(),
    hasTags: z.array(z.string()).optional()
})

const chartModeSchema = z.enum(['grid', 'combined', 'facet', 'default'])

const filtersStateSchema: z.ZodType<ResultsSitemapFiltersState> = z.strictObject({
    options: z
        .strictObject({
            mode: chartModeSchema.optional(),
            supportedModes: z.array(chartModeSchema).optional(),
            showDefaultSeries: z.boolean().optional(),
            enableYearSelect: z.boolean().optional(),
            queryOnLoad: z.boolean().optional(),
            preventQuery: z.boolean().optional(),
            sort: z.string().optional(),
            order: orderSchema.optional()
        })
        .optional(),
    filters: z
        .array(
            z.strictObject({
                year: z.number().optional(),
                conditions: z.array(
                    z.strictObject({
                        sectionId: z.string(),
                        fieldId: z.string(),
                        operator: z.enum(['eq', 'in', 'nin']),
                        value: z.union([z.string(), z.array(z.string())])
                    })
                )
            })
        )
        .nullable()
        .optional(),
    axis1: facetSchema.optional(),
    axis2: facetSchema.optional(),
    facet: facetSchema.optional(),
    bucketsFilter: bucketsFilterSchema.optional()
})

const awardValueSchema = z.union([z.string(), z.number()])

const blockSchema: z.ZodType<ResultsSitemapBlock> = z.lazy(() =>
    z.strictObject({
        id: z.string().optional(),
        template: z.string().optional(),
        blockType: z.string().optional(),
        variants: z.array(blockSchema).optional(),

        // question
        fieldId: z.string().optional(),
        facet: z.string().optional(),

        // i18n
        i18nNamespace: z.string().optional(),
        titleId: z.string().optional(),
        titleKey: z.string().optional(),
        descriptionId: z.string().optional(),
        descriptionKey: z.string().optional(),
        questionKey: z.string().optional(),
        noteKey: z.string().optional(),
        tabId: z.string().optional(),
        takeaway: z.string().optional(),
        takeawayKey: z.string().optional(),
        translateData: z.boolean().optional(),

        // data
        query: z.string().optional(),
        dataPath: z.string().optional(),
        hasData: z.boolean().optional(),
        variables: z.record(z.string(), z.unknown()).optional(),
        parameters: parametersSchema.optional(),
        queryOptions: queryOptionsSchema.optional(),
        filtersState: filtersStateSchema.optional(),
        series: z.array(z.strictObject({ id: z.string(), facet: facetSchema })).optional(),

        // display
        chartOptions: chartOptionsSchema.optional(),
        defaultUnits: unitsSchema.optional(),
        defaultView: z.string().optional(),
        customizationModes: z.array(z.string()).optional(),
        hideOtherAnswersBucket: z.boolean().optional(),

        // layout
        wrapBlock: z.boolean().optional(),
        showInNav: z.boolean().optional(),
        showTitle: z.boolean().optional(),
        hidden: z.boolean().optional(),
        disableExport: z.boolean().optional(),
        hasSponsor: z.boolean().optional(),

        // block-specific content
        items: z.array(z.string()).optional(),
        awards: z
            .array(
                z.strictObject({
                    id: z.string(),
                    value: awardValueSchema.optional(),
                    template: z.string().optional(),
                    awards: z
                        .array(z.strictObject({ id: z.string(), value: awardValueSchema }))
                        .optional()
                })
            )
            .optional(),

        // deprecated (see ResultsSitemapBlock)
        blockNamespace: z.string().optional(),
        chartNamespace: z.string().optional(),
        i18nNamespaces: z.string().optional(),
        intlId: z.string().optional(),
        enableExport: z.boolean().optional(),
        showLegend: z.boolean().optional(),
        isReport: z.boolean().optional(),
        pageId: z.string().optional(),
        year: z.number().optional(),
        chartOnly: z.boolean().optional(),
        dataFunction: z.string().optional(),
        hideCutoff: z.number().optional(),
        units: unitsSchema.optional(),
        extends: z.string().optional(),
        noteId: z.string().nullable().optional(),
        keysPath: z.string().optional(),
        bucketKeysName: z.string().optional(),
        availableUnits: z.array(unitsSchema).optional(),
        showDescription: z.boolean().optional(),
        hasComments: z.boolean().optional(),
        isFreeform: z.boolean().optional(),
        showAverage: z.boolean().optional()
    })
)

const pageSchema: z.ZodType<ResultsSitemapPage> = z.lazy(() =>
    z.strictObject({
        id: z.string(),
        path: z.string(),
        titleId: z.string().optional(),
        descriptionId: z.string().optional(),
        intlId: z.string().optional(),
        i18nNamespace: z.string().optional(),
        showTitle: z.boolean().optional(),
        is_hidden: z.boolean().optional(),
        defaultBlockType: z.string().optional(),
        blocks: z.array(blockSchema).optional(),
        children: z.array(pageSchema).optional(),

        // deprecated (see ResultsSitemapPage)
        showSidebar: z.boolean().optional(),
        variables: z.record(z.string(), z.unknown()).optional()
    })
)

export const resultsSitemapSchema: z.ZodType<ResultsSitemap> = z.array(pageSchema)

/**
 * Throws with a readable list of issues if the raw sitemap doesn't match the schema
 */
export const validateRawSitemap = (rawSitemap: unknown, fileName: string) => {
    const result = resultsSitemapSchema.safeParse(rawSitemap)
    if (!result.success) {
        throw new Error(`Invalid ${fileName}:\n${z.prettifyError(result.error)}`)
    }
    return result.data
}
