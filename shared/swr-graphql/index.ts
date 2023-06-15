import useSWR from "swr";
import { print } from "graphql"
import type { DocumentNode } from "graphql"

/**
 * Generates helpers that mimicks Apollo but use SWR or raw fetch calls to send the queries
 * @param graphqlUrl 
 * @returns 
 */
export function createSwrGraphqlClient(graphqlUrl) {
    /**
     * @example useSWR([yourGraphqlQuery, yourGraphqlVariables])
     * @param null if the request is skipped
     */
    function graphqlFetcher([query, variables]: [DocumentNode, any]) {
        // console.debug("Graphql fetcher", graphqlUrl, query, variables)
        return fetch(graphqlUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: print(query), variables }),
        }).then((res) => {
            return res.json()
        })
    }

    function useQuery<TData = any>(query: DocumentNode, variables: any = {}): { loading: boolean, data?: any, error?: any, refetch: () => void } {
        // console.log("use query", query, variables)
        const { data, error, isLoading, isValidating } = useSWR<{ data: TData }>([query, variables], graphqlFetcher)
        return {
            data: data?.data,
            error,
            loading: isLoading, // could be "isLoading || isValidating" if we want to show a loader during revalidation??
            refetch: () => { console.warn("Cannot refetch with swrGraphql", print(query), variables) }
        }
    }

    function useMutation<TData = any, TVariables = any>(mutation: DocumentNode) {
        return (variables: TVariables): Promise<TData> => fetch(graphqlUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: print(mutation), variables }),
        }).then((res) => {
            return res.json()
        })
    }

    return { graphqlFetcher, useQuery, useMutation }
}