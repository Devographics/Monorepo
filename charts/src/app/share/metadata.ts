import { getBlockMeta } from "@/block/metadata"
import { fetchEditionMetadata } from "@devographics/fetch"
import { ChartParams } from "./typings"

export async function getBlockMetaFromParams(chartParams: ChartParams) {
    const { data: edition, error } = await fetchEditionMetadata({
        surveyId: chartParams.survey,
        editionId: chartParams.edition,
        calledFrom: "charts",
    })
    if (error)
        throw new Error(
            `Error while fetching edition metadata (survey: ${chartParams.survey}, edition: ${chartParams.edition
            }): ${error.toString()}`
        )
    const blockMeta = getBlockMeta({
        block: {
            id: chartParams.question,
            sectionId: chartParams.section,
            parameters: {}
        },
        edition,
        // TODO: do an actual translation, we can take the surveyform as inspiration
        // for loading and translating locales in the backend
        getString: key => ({ t: key, locale: { id: chartParams.lang } })
    })
    return blockMeta
}