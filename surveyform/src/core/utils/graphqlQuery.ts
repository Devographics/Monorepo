import { DocumentNode, print } from "graphql";
import { apiRoutes } from "~/lib/apiRoutes";

/**
 * @example useSWR([yourGraphqlQuery, yourGraphqlVariables])
 * @param param0
 */
export function graphqlFetcher([query, variables]: [DocumentNode, any]) {
    return fetch(apiRoutes.graphql.href, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: print(query), variables }),
    }).then((res) => res.json())
}