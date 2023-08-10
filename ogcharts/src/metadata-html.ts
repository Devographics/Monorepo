/**
 * Generate the final HTML header given the generate image URL
 * + the chart parameters
 */
import { Request } from "express"
import { getBlockMeta } from "./block/metadata"
import { getChartParams } from "./chart-data-fetcher"

/**
 * Generate the final URL to be shared, with proper metadata and redirection
 * @param imgUrl 
 * @returns 
 */
export function metadataHtml(req: Request, imgUrl: string) {
    const chartParams = getChartParams(req)
    //  TODO: get the right metadata
    // const blockMeta = getBlockMeta(chartParams)
    // TODO: find where "getBlockMeta" is used in the Gatsby app to get the proper HTML
    return `
    <meta property="og:image" content="${imgUrl}"
    <meta http-equiv="refresh" content="5; URL=TODO THE RESULT APP URL">
    `
}