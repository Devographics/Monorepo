/**
 * Getting charts data
 * TODO: this is based on legacy results app
 */
import { ChartParams } from './typings'
import { BlockDefinition } from '@/block/typings'
import { getAppConfig } from '@/config/server'

export interface ChartData {
    // TODO
}

/**
 * Previously done by parsing the yaml file for a block
 * but we might want to opt for a TypeScript approach
 * @param params
 * @returns
 */
async function getBlockQuery(params: {
    block: BlockDefinition
    editionId: string
    surveyId: string
}) {
    return 'TODO: return the graphql query for a block'
}

/**
 * Demo code from the Gatsby result app
 */
async function queryForChart(chartParams: ChartParams): Promise<string | undefined> {
    // 1. informations about a specific chart are located in the raw_sitemap
    // for instance"results/surveys/css2021/config/raw_sitemap.yml"
    // results/node_src/create_pages.mjs can turn it into a flatter sitemap,
    // we should assess what format is best suited here + add typings
    const block: BlockDefinition = {
        id: chartParams.blockId,
        parameters: {},
        // TODO: get all fields based on the yml sitemap/flattened sitemap
        query: 'currentEditionData'
    }

    // 2. from there we get the block type and can deduce a query
    // This is done in "results/node_src/helpers.mjs" within the "runPageQuery" function
    const query = await getBlockQuery({
        block,
        surveyId: chartParams.surveyId,
        editionId: chartParams.editionId
    })
    // TODO:
    return query
    /*print(gql`
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
        `)*/
}
/**
 * https://github.com/Devographics/Monorepo/blob/main/results/src/core/helpers/blockHelpers.ts#L174
 * https://github.com/Devographics/Monorepo/blob/main/results/src/core/share/ShareBlockTemplate.tsx
 *
 * @returns
 */
export async function fetchChartData(chart: ChartParams, filter?: any): Promise<ChartData> {
    // TODO: validate filter structure with zod
    const { chartDataApi } = getAppConfig()
    const query = await queryForChart(chart)
    if (!query) return {}
    try {
        console.log(`Fetching data ${chartDataApi}`)
        const res = await fetch(chartDataApi, {
            method: 'POST',
            // Print + gql is a trick to get formatting
            // TODO: how to get this query based on the chart parameters ?
            // @ts-ignore
            body: JSON.stringify({
                query
                // Params are already injected in the query, no need to add them separately
            }),
            headers: {
                'content-type': 'application/json'
            }
        })
        const data = await res.json()
        if (data.errors?.length)
            throw new Error(`API returned some errors: ${data.errors.join('')}`)
        const chartData =
            data.data['surveys'][chart.surveyId][chart.editionId][chart.sectionId][chart.blockId]
        console.log('chartData:', chartData)
        return chartData
    } catch (err) {
        console.error(err)
        // TODO: just for the demo
        return {}
    }
}
