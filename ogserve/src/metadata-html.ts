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
export async function renderMetadata(req: Request, imgUrl: string) {
    const chartParams = getChartParams(req)
    try {
        const { data: currentEdition, error } = await fetchEditionMetadata({
            surveyId: chartParams.survey,
            editionId: chartParams.edition,
        })
        if (error) throw new Error(`Error while fetching edition metadata (survey: ${chartParams.survey}, edition: ${chartParams.edition}): ${error.toString()}`)
        const blockMeta = getBlockMeta({
            block: {
                id: chartParams.question,
                sectionId: chartParams.section,
                parameters: {}
            },
            currentEdition,
            // TODO
            currentPath: "TODO: section for this chart",
            host: "TODO: result app url for this edition",
            // TODO: do an actual translation, we can take the surveyform as inspiration
            // for loading and translating locales in the backend
            getString: (key) => ({ t: key, locale: { id: chartParams.lang } }),
        })
        console.log({ blockMeta })
        // Fields are based on what the Gatsby app produces (via React Helmet)
        return `
        <html lang="${chartParams.lang}">
        <head>
            <meta http-equiv="refresh" content="5; URL="${blockMeta.link}">
            <title>${blockMeta.title}</title>
            <meta charset="utf-8">
            <meta property="description" content="${blockMeta.subtitle}>
            <meta property="og:title" content="${blockMeta.title}>
            <meta property="og:description" content="${blockMeta.subtitle}>
            <meta property="og:type" content="article">
            <meta property="og:image" content="${imgUrl}">
            <meta property="og:url" content="${blockMeta.link}">
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:image:src" content="${imgUrl}">
            <meta name="twitter:title" content="${blockMeta.title}">
            </head>
        <body>
            Redirecting to the Devographics survey page...
        </body>
        </html>
            `
    } catch (err) {
        console.error(err)
        // TODO: render generic metadata pointing to the devographics website in case of unexpected error
        return ``
    }

}