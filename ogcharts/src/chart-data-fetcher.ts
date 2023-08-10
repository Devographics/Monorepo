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

async function queryForChart(chart: ChartParams): Promise<string> {
    return print(gql`
query surveyApi {
    survey(survey: state_of_css) {
        browsers: environments(id: browsers, filters: {}, options: {}) {
            id
            year(year: 2021) {
                year
                completion {
                    total
                    count
                    percentage_survey
                }
                facets {
                    id
                    type
                    completion {
                        total
                        percentage_question
                        percentage_survey
                        count
                    }
                    buckets {
                        id
                        count
                        percentage_question
                        percentage_survey
                        entity {
                            homepage {
                                url
                            }
                            name
                            github {
                                url
                            }
                        }
                    }
                }
            }
        }
    }
}
        `)

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
    const query = await queryForChart(chart)
    try {

        const data = await fetch(chartDataApi, {
            method: "POST",
            // Print + gql is a trick to get formatting
            // TODO: how to get this query based on the chart parameters ?
            body: JSON.stringify({
                query,
                params: {}
            }),
            headers: {
                "content-type": "application/json"
            }
        })
        return data
    } catch (err) {
        console.error(err)
        // TODO: just for the demo
        return {}
    }
}