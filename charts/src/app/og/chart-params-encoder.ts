/**
 * Megaparam pattern for the chart parameters
 * 
 * Allow to statically render some charts
 * 
 * https://blog.vulcanjs.org/render-anything-statically-with-next-js-and-the-megaparam-4039e66ffde
 */
import { ChartParams } from "./typings";

/**
 * Asynchronous because validation might require accessing
 * some configuration asynchronously (surveys list for instance)
 * @param chartParamsStr 
 * @returns 
 */
export async function decodeChartParams(chartParamsStr: string): Promise<ChartParams> {
    const decodedParams = decodeURIComponent(chartParamsStr)
    console.log("decoding", { decodedParams, chartParamsStr })
    const params = new URLSearchParams(decodedParams)
    // TODO: use Zod to actually validate the params
    return {
        lang: params.get("lang")!,
        survey: params.get("survey")!,
        edition: params.get("edition")!,
        section: params.get("section")!,
        question: params.get("question")!,
    }
}
/**
 * Encode chart params provided as search parameters
 * into a string that can be used as a route params
 * 
 * We do not validate the params at this point
 * 
 * @example
 * /og/static?lang=fr&survey=state_of_js&edition=js2022&section=environment&question=browser
 * becomes a route parameter:
 * /og/static/lang%3Dfr%26survey%3Dstate_of_js%26edition%3Djs2022%26section%3Denvironment%26question%3Dbrowser"/
 */
export function encodeChartParams(chartParams: ChartParams): string {
    const params = new URLSearchParams(chartParams as any)
    return encodeURIComponent(params.toString())
}