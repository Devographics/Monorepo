import merge from 'lodash/merge.js'
import path from 'path'
import { logToFile } from './log_to_file'
// import { allowedCachingMethods } from "@devographics/fetch"

import { parse } from 'graphql'
import { print } from 'graphql-print'
import { getBlockQuery } from './queries/queries'
import type { BlockQueryError, BlockQueryErrors } from '../src/core/types/context'
import {
    allowedCachingMethods,
    getDataLocations,
    getExistingJSON,
    getExistingString,
    getLoadMethod,
    parseCustomQuery,
    removeNull
} from './helpers'

/*

Try loading data from disk or GitHub, or else run queries for *each block* in a page

Blocks whose query fails do not stop the build: the failure is collected in
`blockErrors`, keyed by block variant id, and returned alongside the data so it
can be put in the page context and shown by the block itself. Without this a
failed query is indistinguishable at render time from a block that legitimately
has no data.

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
    const blockErrors: BlockQueryErrors = {}

    const recordError = (error: BlockQueryError) => {
        blockErrors[error.blockId] = error
        console.log(`⚠️ Query error for block ${error.blockId}: ${error.message}`)
    }

    for (const b of page.blocks) {
        for (const block of b.variants) {
            if (block.hasData || block.query) {
                let data

                const sectionId = block?.queryOptions?.sectionId || page.id
                const dataDirPath = path.resolve(`${basePath}/data/${sectionId}`)
                const dataFileName = `${block.id}.json`
                const dataFilePath = `${dataDirPath}/${dataFileName}`
                const queryDirPath = path.resolve(`${basePath}/queries/${sectionId}`)
                const queryFileName = `${block.id}.graphql`
                const queryFilePath = `${queryDirPath}/${queryFileName}`

                const existingData = await getExistingJSON({
                    localPath: dataFilePath,
                    remoteUrl: `${baseUrl}/data/${sectionId}/${dataFileName}`
                })
                const existingQueryFormatted = await getExistingString({
                    localPath: queryFilePath,
                    remoteUrl: `${baseUrl}/queries/${sectionId}/${queryFileName}`
                })
                let newQuery
                if (block.query) {
                    const questionId = block.fieldId || block.id
                    newQuery = parseCustomQuery({
                        query: block.query,
                        variables: {
                            surveyId,
                            editionId,
                            sectionId,
                            questionId
                        }
                    })
                    newQuery = `query {${newQuery}}`
                } else {
                    const { query } = await getBlockQuery({
                        block,
                        survey: { id: surveyId },
                        edition: currentEdition,
                        section: { id: sectionId },
                        chartFilters: block.filtersState
                    })
                    newQuery = query
                }
                let newQueryFormatted
                try {
                    const ast = parse(newQuery)
                    newQueryFormatted = print(ast, { preserveComments: true })
                } catch (error) {
                    console.warn(error)
                    console.log('⚠️ Detected issue in follwing query: ')
                    console.log(newQuery)
                    recordError({
                        blockId: block.id,
                        sectionId,
                        type: 'parse',
                        message: error.message,
                        query: newQuery
                    })
                    // nothing was formatted, so there is no query to run and
                    // nothing to merge into the page data
                    continue
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
                        : process.env.DISABLE_CACHE === 'true'
                        ? '[cache disabled] '
                        : ''
                    console.log(`// 🔍 ${reason}Running uncached query for file ${dataFileName}…`)

                    logToFile(queryFileName, newQueryFormatted, {
                        mode: 'overwrite',
                        dirPath: queryDirPath
                    })

                    // wrap with "dataAPI {...}" for Gatsby
                    const wrappedQuery =
                        newQueryFormatted.replace('query {', 'query { dataAPI {') + '}'

                    // read the errors off the raw result: removeNull walks the
                    // whole object and would not preserve GraphQL error objects
                    const rawResult = await graphql(wrappedQuery)
                    const result = removeNull(rawResult)
                    data = result.data

                    const queryErrors = rawResult.errors
                    if (queryErrors?.length || !data) {
                        logToFile(queryFileName, newQueryFormatted, {
                            mode: 'overwrite',
                            subDir: 'error_queries'
                        })
                        console.log(result)
                        recordError({
                            blockId: block.id,
                            sectionId,
                            type: 'query',
                            message:
                                queryErrors?.map(e => e.message).join('; ') ||
                                'Query returned no data',
                            errors: queryErrors?.map(e => ({ message: e.message, path: e.path })),
                            query: newQueryFormatted
                        })
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

    const errorCount = Object.keys(blockErrors).length
    console.log(
        `-> Done in ${duration}ms${errorCount ? ` (${errorCount} block(s) with query errors)` : ''}`
    )
    return { pageData, blockErrors }
}
