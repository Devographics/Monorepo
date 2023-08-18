/**
 * Keep me middleware friendly
 * 
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
 * into a string
 * 
 * NOTE: we do not URI encode the parameter to avoid double encoding
 * (because Next generateStaticParams will automatically do it under the hood)
 * 
 * We do not validate the params at this point
 * 
 * 
 * @example
 * /share/static?lang=fr&survey=state_of_js&edition=js2022&section=environment&question=browser
 * becomes a route parameter:
 * /share/static/lang%3Dfr%26survey%3Dstate_of_js%26edition%3Djs2022%26section%3Denvironment%26question%3Dbrowser"/
 */
export function encodeChartParams(chartParams: ChartParams): string {
    const params = new URLSearchParams(chartParams as any)
    return params.toString()
}