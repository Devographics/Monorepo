/*

Resolve "datapoint paths" used in takeaways, such as:

{@$block.range_0_4}
{@$block_vs_income_evolution.company_employee.increased}
{@$block:devs2025.tokyo+kanagawa.count}
[gender]{@$block_men_vs_non_men}

In takeaways, paths always start with `@`. The functions below take the path
without it: block[:edition][.bucket[.facetBucket]][.stat]

- block: a variant id as it appears in the page data; `$block` is the takeaway's
  own block, `$block_vs_salary` is the block id followed by that suffix
- edition: read another edition from the same data (defaults to the current one)
- bucket/facetBucket: bucket ids; `+` combines several buckets (values are summed)
- stat: percentage (default), count, median, average, or any percentile (p75…)

A path with only a block (no bucket or stat) has no value: it can only be used
in [text]{@path} links, to point to the whole block (e.g. a tab).

Note: this file should only contain type imports so it can be tested with node:test

*/

export const PATH_PREFIX = '@'
export const BLOCK_PLACEHOLDER = '$block'
export const EDITION_SEPARATOR = ':'
export const BUCKETS_SEPARATOR = '+'

export type DatapointStat = 'percentage' | 'count' | 'median' | 'average' | string

export interface DatapointContext {
    pageData: any
    surveyId: string
    editionId: string
    // id of the block the takeaway belongs to, used to expand `$block`
    blockId: string
}

export interface ParsedDatapointPath {
    // id of the block variant, with `$block` expanded
    blockId: string
    // edition to read, if different from the current one
    editionId?: string
    // one array of ids per level: [bucketIds, facetBucketIds]
    bucketLevels: string[][]
    stat?: DatapointStat
}

export interface ResolvedDatapoint {
    path: string
    // path with `$block` expanded
    fullPath: string
    blockId: string
    // edition the value comes from (the current one unless specified)
    editionId: string
    // id of the question the block is about
    questionId?: string
    // ids of the chart elements the datapoint refers to, e.g. `company_employee.increased`
    elementIds: string[]
    stat: DatapointStat
    value?: number
    error?: string
}

const isStat = (segment: string) =>
    ['percentage', 'count', 'median', 'average'].includes(segment) || /^p\d{1,3}$/.test(segment)

export const expandBlockId = (blockSegment: string, mainBlockId: string) => {
    if (blockSegment.startsWith(BLOCK_PLACEHOLDER)) {
        return mainBlockId + blockSegment.slice(BLOCK_PLACEHOLDER.length)
    }
    return blockSegment
}

export const parseDatapointPath = (path: string, mainBlockId: string): ParsedDatapointPath => {
    const segments = path.split('.')
    const [blockSegment, editionId] = segments[0].split(EDITION_SEPARATOR)
    const parsed: ParsedDatapointPath = {
        blockId: expandBlockId(blockSegment, mainBlockId),
        bucketLevels: []
    }
    if (editionId) {
        parsed.editionId = editionId
    }
    const rest = segments.slice(1)
    if (rest.length > 0 && isStat(rest[rest.length - 1])) {
        parsed.stat = rest.pop()
    }
    for (const segment of rest) {
        parsed.bucketLevels.push(segment.split(BUCKETS_SEPARATOR))
    }
    return parsed
}

// variant data lives at dataAPI.surveys.<survey>.<edition>.<section>.<variant>,
// but we don't know the section so we look through all of them
export const getBlockData = (context: DatapointContext, blockId: string) => {
    const { pageData, surveyId, editionId } = context
    const sections = pageData?.dataAPI?.surveys?.[surveyId]?.[editionId]
    if (!sections) {
        return
    }
    for (const sectionId of Object.keys(sections)) {
        const blockData = sections[sectionId]?.[blockId]
        if (blockData) {
            return blockData
        }
    }
}

export const getEditionData = (blockData: any, editionId: string) => {
    // freeform questions (e.g. native languages) store their data under `freeform`
    const allEditions =
        blockData?.combined?.allEditions ||
        blockData?.freeform?.allEditions ||
        blockData?.allEditions ||
        []
    const editionData = allEditions.find((e: any) => e.editionId === editionId)
    if (editionData) {
        return editionData
    }
    if (blockData?.currentEdition?.editionId === editionId) {
        return blockData.currentEdition
    }
}

// stat for the whole question, e.g. the overall median
const getEditionStat = (editionData: any, stat: DatapointStat) => {
    if (stat === 'count') {
        return editionData.completion?.count
    } else if (stat === 'average') {
        return editionData.average
    } else if (stat === 'median') {
        return editionData.percentiles?.p50
    } else if (stat.startsWith('p')) {
        return editionData.percentiles?.[stat]
    }
}

// stat for a single bucket; percentages are relative to the parent
// (question for top-level buckets, bucket for facet buckets)
const getBucketStat = ({
    bucket,
    stat,
    isFacetBucket
}: {
    bucket: any
    stat: DatapointStat
    isFacetBucket: boolean
}) => {
    if (stat === 'percentage') {
        return isFacetBucket ? bucket.percentageBucket : bucket.percentageQuestion
    } else if (stat === 'count') {
        return bucket.count
    } else if (stat === 'average') {
        return bucket.averageByFacet
    } else if (stat === 'median') {
        return bucket.percentilesByFacet?.p50
    } else if (stat.startsWith('p')) {
        return bucket.percentilesByFacet?.[stat]
    }
}

const canBeSummed = (stat: DatapointStat) => stat === 'percentage' || stat === 'count'

export const resolveDatapoint = (path: string, context: DatapointContext): ResolvedDatapoint => {
    const parsed = parseDatapointPath(path, context.blockId)
    const { blockId, bucketLevels } = parsed
    const editionId = parsed.editionId || context.editionId
    const stat = parsed.stat || (bucketLevels.length > 0 ? 'percentage' : '')

    let fullPath = blockId
    if (parsed.editionId) {
        fullPath += EDITION_SEPARATOR + parsed.editionId
    }
    for (const ids of bucketLevels) {
        fullPath += '.' + ids.join(BUCKETS_SEPARATOR)
    }
    if (parsed.stat) {
        fullPath += '.' + parsed.stat
    }

    const result: ResolvedDatapoint = { path, fullPath, blockId, editionId, elementIds: [], stat }

    // a path with only a block points to the whole block and has no value,
    // so there's no need to look up its data
    if (bucketLevels.length === 0 && !stat) {
        return result
    }

    const blockData = getBlockData(context, blockId)
    if (!blockData) {
        result.error = `No data found for block "${blockId}"`
        return result
    }
    result.questionId = blockData.id
    const editionData = getEditionData(blockData, editionId)
    if (!editionData) {
        result.error = `No data found for edition "${editionId}" in block "${blockId}"`
        return result
    }

    if (bucketLevels.length === 0) {
        result.value = getEditionStat(editionData, stat)
        if (result.value === undefined) {
            result.error = `No "${stat}" value found for block "${blockId}"`
        }
        return result
    }

    if (bucketLevels.length > 2) {
        result.error = `Paths can have at most two bucket levels (bucket and facet bucket)`
        return result
    }

    // collect the targeted buckets along with their element ids
    let buckets: Array<{ bucket: any; elementId: string }> = []
    for (const bucketId of bucketLevels[0]) {
        const bucket = editionData.buckets?.find((b: any) => b.id === bucketId)
        if (!bucket) {
            result.error = `No bucket "${bucketId}" found in block "${blockId}"`
            return result
        }
        buckets.push({ bucket, elementId: bucketId })
    }
    const isFacetBucket = bucketLevels.length === 2
    if (isFacetBucket) {
        const facetBuckets = []
        for (const { bucket, elementId } of buckets) {
            for (const facetBucketId of bucketLevels[1]) {
                const facetBucket = bucket.facetBuckets?.find((b: any) => b.id === facetBucketId)
                if (!facetBucket) {
                    result.error = `No facet bucket "${facetBucketId}" found in bucket "${elementId}" of block "${blockId}"`
                    return result
                }
                facetBuckets.push({
                    bucket: facetBucket,
                    elementId: `${elementId}.${facetBucketId}`
                })
            }
        }
        buckets = facetBuckets
    }

    if (buckets.length > 1 && !canBeSummed(stat)) {
        result.error = `"${stat}" values cannot be combined with "${BUCKETS_SEPARATOR}"`
        return result
    }

    let total = 0
    for (const { bucket, elementId } of buckets) {
        const value = getBucketStat({ bucket, stat, isFacetBucket })
        if (value === undefined || value === null) {
            result.error = `No "${stat}" value found for "${elementId}" in block "${blockId}"`
            return result
        }
        total += value
        result.elementIds.push(elementId)
    }
    result.value = total
    return result
}

/*

Rendering

Replace `{@path}` with the formatted value, and `[text]{@path}` with the text,
both wrapped in a span pointing to the chart elements. Other `{…}` placeholders
are left alone.

The app uses renderDatapoints() (see renderDatapoints.ts), which calls this
with the page's data and formatting. The spans only describe the datapoint:
interactions (tooltip, highlighting, opening the tab) are added by the
Datapoint component when the takeaway is rendered.

*/

const DATAPOINT_REGEX = /(?:\[([^\]]+)\])?\{@([^{}\s]+)\}/g

const escapeAttribute = (s: string) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;')

export const replaceDatapoints = ({
    html,
    context,
    formatDatapoint
}: {
    html: string
    context: DatapointContext
    formatDatapoint: (datapoint: ResolvedDatapoint) => string
}) =>
    html.replace(DATAPOINT_REGEX, (_match, text: string | undefined, path: string) => {
        const datapoint = resolveDatapoint(path, context)
        // block-only paths have no value to show, so they need a text
        if (!datapoint.error && datapoint.value === undefined && !text) {
            datapoint.error = `"${path}" has no value, use it as a link: [text]{@${path}}`
        }
        if (datapoint.error) {
            console.warn(
                `// Datapoint error in takeaway for block "${context.blockId}": ${datapoint.error}`
            )
            const error = `<span class="datapoint-error" title="${escapeAttribute(
                datapoint.error
            )}">[?@${path}]</span>`
            return text ? `${text} ${error}` : error
        }
        const attributes = [
            `class="datapoint"`,
            `data-datapoint-block="${escapeAttribute(datapoint.blockId)}"`,
            `data-datapoint-edition="${escapeAttribute(datapoint.editionId)}"`,
            `data-datapoint="${escapeAttribute(datapoint.elementIds.join(' '))}"`
        ]
        if (text) {
            // when the text doesn't show the value, show it in a tooltip instead
            if (datapoint.value !== undefined) {
                const formatted = formatDatapoint(datapoint)
                attributes.push(`data-datapoint-value="${escapeAttribute(formatted)}"`)
            }
            return `<span ${attributes.join(' ')}>${text}</span>`
        }
        return `<span ${attributes.join(' ')}>${formatDatapoint(datapoint)}</span>`
    })
