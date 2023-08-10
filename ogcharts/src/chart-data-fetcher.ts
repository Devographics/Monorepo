// *** Getting charts data
import gql from "graphql-tag"
import { print } from "graphql"
import { getConfig } from "./config"

export interface ChartFilter {
    // TODO: get from shared code?
}

export interface ChartData {

}

export async function fetchChartData(filter: ChartFilter): Promise<ChartData> {
    // TODO: validate filter structure with zod
    const { chartDataApi } = getConfig()
    const data = await fetch(chartDataApi, {
        method: "POST",
        // Print + gql is a trick to get formatting
        body: print(gql`TODO ${filter}`),
        headers: {
            "content-type": "application/graphql"
        }
    })
    return data
}