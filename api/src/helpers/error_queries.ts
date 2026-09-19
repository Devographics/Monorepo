import type { Config } from 'apollo-server-express'
import { logToFile } from '@devographics/debug'

type Plugin = NonNullable<Config['plugins']>[number]

/*

Log every GraphQL query that triggers errors to `error_queries/`
(inside LOGS_PATH), along with its variables and the errors themselves.

Note: like all `logToFile` calls, this only does something in development.

*/
export const errorQueriesPlugin: Plugin = {
    async requestDidStart() {
        return {
            async didEncounterErrors(requestContext) {
                const { request, errors, operationName } = requestContext
                const { query, variables } = request
                if (!query) {
                    return
                }
                const queryName = operationName ?? query.match(/query (\w+)/)?.[1] ?? 'query'
                const fileName = `${new Date().getTime()}__${queryName}`
                await logToFile(`error_queries/${fileName}.graphql`, query)
                await logToFile(`error_queries/${fileName}.errors.json`, { variables, errors })
            }
        }
    }
}
