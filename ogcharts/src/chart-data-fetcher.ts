// *** Getting charts data
import type { Request } from "express"
import gql from "graphql-tag"
import { print } from "graphql"
import { getAppConfig } from "./config"
import { getBlockQuery } from "./block/block-query"
import { BlockDefinition } from "./block/typings"

/**
 * TODO: cf API code that uses this a lot to generate the charts
 */
export interface ChartParams {
    survey: string,
    edition: string,
    section: string,
    question: string
    lang: string
}

export interface ChartFilter {
    // TODO: get from shared code?
}

export interface ChartData {

}

/**
 * Valid query parameters are survey, edition, section, question and lang
 * @param req 
 * @returns 
 */
export function getChartParams(req: Request): ChartParams {
    // TODO: validate with zod
    return {
        survey: req.query.survey as string,
        edition: req.query.edition as string,
        section: req.query.section as string,
        question: req.query.question as string,
        lang: req.query.lang as string || "en-US"
    }
}

async function queryForChart(chart: ChartParams): Promise<string> {
    // 1. informations about a specific chart are located in the raw_sitemap
    // for instance"results/surveys/css2021/config/raw_sitemap.yml"
    // results/node_src/create_pages.mjs can turn it into a flatter sitemap,
    // we should assess what format is best suited here + add typings
    // @ts-ignore
    const block: BlockDefinition = {
        id: chart.question,
        sectionId: chart.section,
        // TODO: get all fields based on the yml sitemap
    }

    // 2. from there we get the block type and can deduce a query
    // This is done in "results/node_src/helpers.mjs" within the "runPageQuery" function
    const query = getBlockQuery({ block, surveyId: chart.survey, editionId: chart.edition })

    // TODO:
    return print(gql`
query css2022cssFrameworksExperienceLinechartQuery {
        surveys {
        state_of_css {
            css2022 {
                css_frameworks {
                    css_frameworks_experience_linechart_1: css_frameworks_ratios {
                        years
                        items(filters: {user_info__gender:{eq:male}}) {
                            id
                            usage {
                                year
                                rank
                                percentageQuestion
                            }
                            awareness {
                                year
                                rank
                                percentageQuestion
                            }
                            interest {
                                year
                                rank
                                percentageQuestion
                            }
                            satisfaction {
                                year
                                rank
                                percentageQuestion
                            }
                        }
                    }
                    css_frameworks_experience_linechart_2: css_frameworks_ratios {
                        years
                        items(filters: {user_info__gender:{eq:female}}) {
                            id
                            usage {
                                year
                                rank
                                percentageQuestion
                            }
                            awareness {
                                year
                                rank
                                percentageQuestion
                            }
                            interest {
                                year
                                rank
                                percentageQuestion
                            }
                            satisfaction {
                                year
                                rank
                                percentageQuestion
                            }
                        }
                    }
                    css_frameworks_experience_linechart_3: css_frameworks_ratios {
                        years
                        items(filters: {user_info__gender:{eq:non_binary}}) {
                            id
                            usage {
                                year
                                rank
                                percentageQuestion
                            }
                            awareness {
                                year
                                rank
                                percentageQuestion
                            }
                            interest {
                                year
                                rank
                                percentageQuestion
                            }
                            satisfaction {
                                year
                                rank
                                percentageQuestion
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
    const { chartDataApi } = getAppConfig()
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