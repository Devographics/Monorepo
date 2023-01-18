// /**
//  * Update cached list of data after a document creation
//  */
import { getVariablesListFromCache } from "./cacheUpdate";
// import { getApolloClient } from "@vulcanjs/next-apollo";
import debug from "debug";
import { multiQuery, Fragment, VulcanGraphqlModel } from "@vulcanjs/graphql";
const debugApollo = debug("vn:apollo");

interface ComputeNewDataArgs {
  model: VulcanGraphqlModel;
  variables: { input: any };
  queryResult: Object;
  mutatedDocument: Object;
  multiResolverName: string;
}
export type ComputeNewDataFunc = (
  args: ComputeNewDataArgs
) => (Object | null) | Promise<Object | null>; // can be async or not

export const multiQueryUpdater =
  (computeNewData) =>
  ({
    model,
    fragment,
    fragmentName,
    resolverName,
  }: {
    model: VulcanGraphqlModel;
    fragment?: Fragment;
    fragmentName?: string;
    resolverName: string;
  }) => {
    // update multi queries
    const { multiResolverName } = model.graphql;
    const modelMultiQuery = multiQuery({
      model,
      fragmentName,
      fragment,
    });
    return async (cache, { data }: { data: any }) => {
      if (!data) {
        throw new Error(
          `No "data" passed to multiQuery updater for resolver ${resolverName} and model ${model.name}`
        );
      }
      if (!data[resolverName]) {
        throw new Error(
          `data[${resolverName}] not defined in multiQuery updater for resolver ${resolverName} and model ${
            model.name
          }. Data: ${data && JSON.stringify(data)}`
        );
      }
      const mutatedDocument = data[resolverName].data;
      // @see https://github.com/VulcanJS/vulcan-npm/issues/7
      //const client = getApolloClient();
      // get all the resolvers that match
      const variablesList = getVariablesListFromCache(cache, multiResolverName); // TODO: mutli resolverName is wrong
      debugApollo(
        "Got variable list from cache",
        variablesList,
        "for resolverName",
        multiResolverName
      );
      // compute all necessary updates
      const multiQueryUpdates = (
        await Promise.all(
          variablesList.map(async (variables) => {
            try {
              const queryResult = cache.readQuery({
                query: modelMultiQuery,
                variables,
              });
              const newData = await computeNewData({
                variables,
                model,
                queryResult,
                mutatedDocument,
                multiResolverName,
              });
              // check if the document should be included in this query, given the query filters
              if (newData) {
                return { query: modelMultiQuery, variables, data: newData };
              }
              return null;
            } catch (err) {
              // could not find the query
              // TODO: be smarter about the error cases and check only for cache mismatch
              console.log(err);
            }
          })
        )
      ).filter((x) => !!x); // filter out null values
      // apply updates to the client
      multiQueryUpdates.forEach((update) => {
        debugApollo("Updating cache with query", update);
        cache.writeQuery(update); // NOTE: watched queries won't be updated
        // @see https://github.com/VulcanJS/vulcan-npm/issues/7
        // client.writeQuery(update);
      });
      // return for potential chainging
      return multiQueryUpdates;
    };
  };
