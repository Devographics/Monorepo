import { getApiUrl } from "./api"

/**
 * Generic GraphQL fetcher
 * Allows to override the API URL
 * and all other fetch options like "cache"
 * @param param0 
 * @returns 
 */
export async function graphqlFetcher<TData = any, TVar = any>(
    query: string,
    /**
     * NOTE: in most scenarios where variables are not depending on user input,
     * it's easier to inject the variables directly in the query using a query builder function
     * and have a nameless query
     * "query { locale(localeId: en_US)}"
     * versus "query locale($localeId: String) { locale(localeId: $localeId) }"
     */
    variables?: TVar,
    fetchOptions?: Partial<ResponseInit>,
    apiUrl_?: string,
): Promise<{
    data?: TData,
    errors?: Array<Error>
}> {
    const apiUrl = apiUrl_ || getApiUrl()
    // console.debug(`// querying ${apiUrl} (${query.slice(0, 15)}...)`)
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({ query, variables: variables || {} }),
        ...(fetchOptions || {})
    })
    const json: any = await response.json()
    return json
}