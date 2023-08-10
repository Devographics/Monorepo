// *** Getting charts data
import type { Request } from "express"
import gql from "graphql-tag"
import { print } from "graphql"
import { getConfig } from "./config"

/**
 * TODO: cf API code that uses this a lot to generate the charts
 */
export interface ChartParams {
    survey: string,
    edition: string,
    section: string,
    question: string
}
export interface ChartFilter {
    // TODO: get from shared code?
}

export interface ChartData {

}

export function getChartParams(req: Request): ChartParams {
    // TODO: validate with zod
    return {
        survey: req.params.survey,
        edition: req.params.edition,
        section: req.params.section,
        question: req.params.question
    }
}
/**
 * https://github.com/Devographics/Monorepo/blob/main/results/src/core/helpers/blockHelpers.ts#L174
 * https://github.com/Devographics/Monorepo/blob/main/results/src/core/share/ShareBlockTemplate.tsx
 * 
 * @returns 
 */
export async function fetchChartData(chart: ChartParams, filter?: ChartFilter): Promise<ChartData> {
    // TODO: validate filter structure with zod
    const { chartDataApi } = getConfig()
    const data = await fetch(chartDataApi, {
        method: "POST",
        // Print + gql is a trick to get formatting
        body: print(gql`TODO ${chart} ${filter}`),
        headers: {
            "content-type": "application/graphql"
        }
    })
    return data
}