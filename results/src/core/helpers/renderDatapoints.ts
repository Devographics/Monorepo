import { PageContextValue } from 'core/types'
import { getAllQuestions } from 'core/helpers/options'
import { formatLocalizedValue, getQuestionUnit } from 'core/charts/common2/helpers/format'
import { DatapointContext, ResolvedDatapoint, replaceDatapoints } from 'core/helpers/datapoints'

// find a variant by id, including filtered series (`foo_2` belongs to variant `foo`)
const findVariant = (pageContext: PageContextValue, blockId: string) => {
    for (const block of pageContext.blocks || []) {
        for (const variant of block.variants) {
            if (blockId === variant.id || blockId.match(new RegExp(`^${variant.id}_\\d+$`))) {
                return variant
            }
        }
    }
}

/*

Medians, averages and percentiles use the unit of the question they describe:
the question itself for question-level stats ({@$block.median}),
or the variant's facet for bucket-level stats ({@$block_vs_salary.man.median})

*/
const getStatQuestion = (pageContext: PageContextValue, datapoint: ResolvedDatapoint) => {
    const allQuestions = getAllQuestions(pageContext.currentEdition)
    if (datapoint.elementIds.length === 0) {
        return allQuestions.find(q => q.id === datapoint.questionId)
    }
    const variant = findVariant(pageContext, datapoint.blockId)
    const facet = variant?.filtersState?.facet || variant?.filtersState?.axis2
    if (facet) {
        return allQuestions.find(q => q.id === facet.id)
    }
}

const getDatapointFormatter = (pageContext: PageContextValue) => (datapoint: ResolvedDatapoint) => {
    const value = datapoint.value as number
    const { localeId } = pageContext
    if (datapoint.stat === 'percentage') {
        return formatLocalizedValue({ value, unit: 'percentage', localeId })
    } else if (datapoint.stat === 'count') {
        return formatLocalizedValue({ value, unit: 'count', localeId })
    } else {
        const unit = getQuestionUnit(getStatQuestion(pageContext, datapoint))
        return formatLocalizedValue({ value, unit, localeId })
    }
}

const getDatapointContext = (pageContext: PageContextValue, blockId: string): DatapointContext => ({
    pageData: pageContext.pageData,
    surveyId: pageContext.currentSurvey.id,
    editionId: pageContext.currentEdition.id,
    blockId
})

/*

Replace {path} and [text]{path} datapoints in a takeaway's HTML
with values from the page's data

- blockId: id of the block the takeaway belongs to, used to expand `$block`

*/
export const renderDatapoints = ({
    takeaway,
    pageContext,
    blockId
}: {
    takeaway: string
    pageContext: PageContextValue
    blockId: string
}) =>
    replaceDatapoints({
        html: takeaway,
        context: getDatapointContext(pageContext, blockId),
        formatDatapoint: getDatapointFormatter(pageContext)
    })
