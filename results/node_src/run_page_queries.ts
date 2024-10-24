import merge from 'lodash/merge.js'
import path from 'path'
import { logToFile } from './log_to_file'
// import { allowedCachingMethods } from "@devographics/fetch"

import { parse } from 'graphql'
import { print } from 'graphql-print'
import { getBlockQuery } from './queries/queries'
import {
    allowedCachingMethods,
    getDataLocations,
    getExistingJSON,
    getExistingString,
    getLoadMethod,
    removeNull
} from './helpers'

/*

Try loading data from disk or GitHub, or else run queries for *each block* in a page

*/
export const runPageQueries = async ({ page, graphql, surveyId, editionId, currentEdition }) => {
    const startedAt = new Date()
    const useFilesystemCache = allowedCachingMethods().filesystem
    const useApiCache = allowedCachingMethods().api
    console.log(`// Running GraphQL queries for page ${page.id}…`)

    const paths = getDataLocations(surveyId, editionId)

    const basePath = paths.localPath + '/results'
    const baseUrl = paths.url + '/results'

    let pageData = {}

    for (const b of page.blocks) {
        for (const block of b.variants) {
            if (block.query) {
                let data

                const dataDirPath = path.resolve(`${basePath}/data/${page.id}`)
                const dataFileName = `${block.id}.json`
                const dataFilePath = `${dataDirPath}/${dataFileName}`
                const queryDirPath = path.resolve(`${basePath}/queries/${page.id}`)
                const queryFileName = `${block.id}.graphql`
                const queryFilePath = `${queryDirPath}/${queryFileName}`

                const existingData = await getExistingJSON({
                    localPath: dataFilePath,
                    remoteUrl: `${baseUrl}/data/${page.id}/${dataFileName}`
                })
                const existingQueryFormatted = await getExistingString({
                    localPath: queryFilePath,
                    remoteUrl: `${baseUrl}/queries/${page.id}/${queryFileName}`
                })
                const { query: newQuery } = await getBlockQuery({
                    block,
                    survey: { id: surveyId },
                    edition: currentEdition,
                    section: { id: page.id },
                    chartFilters: block.filtersState
                })
                let newQueryFormatted
                try {
                    const ast = parse(newQuery)
                    newQueryFormatted = print(ast, { preserveComments: true })
                } catch (error) {
                    console.warn(error)
                    console.log('⚠️ Detected issue in follwing query: ')
                    console.log(newQuery)
                }

                const queryHasChanged = newQueryFormatted !== existingQueryFormatted

                if (
                    useFilesystemCache &&
                    existingData &&
                    (process.env.FROZEN === 'true' || !queryHasChanged)
                ) {
                    console.log(
                        `// 🎯 File ${dataFileName} found on ${getLoadMethod()}, loading its contents…`
                    )
                    data = existingData
                } else {
                    const reason = !existingData
                        ? '[no data found] '
                        : queryHasChanged
                        ? '[query change detected] '
                        : ''
                    console.log(`// 🔍 ${reason}Running uncached query for file ${dataFileName}…`)

                    logToFile(queryFileName, newQueryFormatted, {
                        mode: 'overwrite',
                        dirPath: queryDirPath
                    })

                    // wrap with "dataAPI {...}" for Gatsby
                    const wrappedQuery =
                        newQueryFormatted.replace('query {', 'query { dataAPI {') + '}'

                    const result = removeNull(await graphql(wrappedQuery))
                    data = result.data

                    if (!data) {
                        console.log(result)
                    }
                    logToFile(dataFileName, data, {
                        mode: 'overwrite',
                        dirPath: dataDirPath
                        //editionId
                    })
                }
                pageData = merge(pageData, data)
            }
        }
    }

    const finishedAt = new Date()
    const duration = finishedAt.getTime() - startedAt.getTime()

    console.log(`-> Done in ${duration}ms`)
    return pageData
}
