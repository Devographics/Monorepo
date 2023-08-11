/**
 * Generate the final HTML header given the generate image URL
 * + the chart parameters
 * 
 * Handles loading relevant configuration like the current edition
 * (basically everything except generating the chart image)
 */
import { fetchEditionMetadata } from "@devographics/fetch"
import { Request } from "express"
import { getBlockMeta } from "./block/metadata"
import { getChartParams } from "./chart-data-fetcher"

/**
 * Generate the final URL to be shared, with proper metadata and redirection
 * @param imgUrl 
 * @returns 
 */
export async function metadataHtml(req: Request, imgUrl: string) {
    const chartParams = getChartParams(req)
    try {
        const { data: currentEdition, error } = await fetchEditionMetadata({
            surveyId: chartParams.survey,
            editionId: chartParams.edition,
        })
        if (error) throw new Error(`Error while fetchin edition metadata (survey: ${chartParams.survey}, edition: ${chartParams.edition}): ${error.toString()}`)
        //  TODO: get the right metadata
        const blockMeta = getBlockMeta({
            block: {
                id: chartParams.question,
                sectionId: chartParams.section,
                parameters: {}
            },
            currentEdition,
            currentPath: "TODO: section for this chart",
            host: "TODO: result app url for this edition",
            getString: (key) => ({ t: "TODO getString:" + key, locale: { id: chartParams.lang } }),
        })
        console.log({ blockMeta })
        // TODO: find where "getBlockMeta" is used in the Gatsby app to get the proper HTML
        return `
            <meta property="og:image" content="${imgUrl}">
            <meta http-equiv="refresh" content="5; URL=TODO THE RESULT APP URL">
            `
    } catch (err) {
        console.error(err)
        // TODO: render generic metadata pointing to the devographics website in case of unexpected error
        return ``
    }

}