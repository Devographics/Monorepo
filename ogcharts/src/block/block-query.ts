/**
 * Adapted from results/node_src/helpers.mjs runQuery function
 */
import { BlockDefinition } from "./typings"
// import path from "path"
import { buildBlockQuery } from "./queries"

function logToFile(...args) {
    console.log("LOG TO FILE:", ...args)
}

export async function getBlockQuery({ block, surveyId, editionId }: {
    block: BlockDefinition,
    surveyId: string,
    editionId: string,
}) {
    if (!block.query) return
    let data
    /*
    Mostly for caching see results/node_src/helpers.mjs
    const dataDirPath = path.resolve(`${basePath}/data/${page.id}`)
    const dataFileName = `${block.id}.json`
    const dataFilePath = `${dataDirPath}/${dataFileName}`
    const queryDirPath = path.resolve(`${basePath}/queries/${page.id}`)
    const queryFileName = `${block.id}.graphql`
    const queryFilePath = `${queryDirPath}/${queryFileName}`
    */

    /*
    Caching mechanism to avoid getting the chart graphql query all the time

    const existingData = await getExistingData({
        dataFileName,
        dataFilePath,
        baseUrl
    })
    if (existingData && useCache) {
        console.log(
            `// 🎯 File ${dataFileName} found on ${getLoadMethod()}, loading its contents…`
        )
        data = existingData
    }
    */

    const questionId = block.id
    const queryOptions = {
        surveyId,
        editionId,
        sectionId: block.sectionId,
        //sectionId: page.id,
        questionId,
        fieldId: block.fieldId,
        isLog: false,
        addRootNode: true,
        ...block.queryOptions
    }

    const queryArgs = {
        facet: block.facet,
        filters: block.filters,
        parameters: { ...block.parameters },//, enableCache: useCache },
        xAxis: block?.variables?.xAxis,
        yAxis: block?.variables?.yAxis
    }

    const query = buildBlockQuery({
        query: block.query,
        queryOptions,
        queryArgs
    })

    // TODO: what's the purpose of this?
    if (query.includes('dataAPI')) {
        const queryLog = buildBlockQuery({
            query: block.query,
            queryOptions: { ...queryOptions, isLog: true, addRootNode: false },
            queryArgs
        })
        /*
        logToFile(queryFileName, queryLog, {
            mode: 'overwrite',
            dirPath: queryDirPath,
            editionId
        })*/
    }

    /*
    Actual data fetching (+ caching) but we want to keep that separated
    const result = await graphql(query)
    data = result.data
    
    logToFile(dataFileName, data, {
        mode: 'overwrite',
        dirPath: dataDirPath,
        editionId
    })*/
    return query
}