/*

Differences with Vulcan Meteor:

- use models instead of collections, to stay isomorphic
- do not accept references for models and fragments (eg collectionName), you have to get the actual value beforehand
- no pattern to get settings: you have to pass the polling option each time (or create your own useMulti that extends this one). Defaults can't be overriden globally.
- deprecate "propertyName" => with hooks you can rename when consuming the hook instead
- automated pluralization is forbidden, eg in graphql templates 
=> user has to provide a multiTypeName in the model (could be improved but automated pluralization must be avoided)
*/

import { DocumentNode } from "graphql";
import { useQuery, UseQueryState, UseQueryArgs } from "urql";
import { useState } from "react";
import {
  VulcanGraphqlModel,
  MultiVariables,
  MultiInput,
  multiQuery,
} from "@vulcanjs/graphql";
import get from "lodash/get.js";
import { buildMultiQueryOptions } from "@devographics/crud";

// default query input object
const defaultInput = {
  limit: 20,
  enableTotal: true,
  enableCache: false,
};

const getInitialPaginationInput = (options, props) => {
  // get initial limit from props, or else options, or else default value
  const limit =
    (props.input && props.input.limit) ||
    (options.input && options.input.limit) ||
    options.limit ||
    defaultInput.limit;
  const paginationInput = {
    limit,
  };
  return paginationInput;
};

/**
 * Query updater after a fetch more
 * @param resolverName
 */
export const fetchMoreUpdateQuery =
  (resolverName: string) =>
    (previousResults, { fetchMoreResult }) => {
      // no more post to fetch
      if (!fetchMoreResult[resolverName]?.results?.length) {
        return previousResults;
      }
      const newResults = {
        ...previousResults,
        [resolverName]: { ...previousResults[resolverName] },
      };
      newResults[resolverName].results = [
        ...previousResults[resolverName].results,
        ...fetchMoreResult[resolverName].results,
      ];
      return newResults;
    };

const buildMultiResult = <TModel, TData, TVariables>(
  options: UseMultiOptions<TModel, TData, TVariables>,
  { fragmentName, fragment, resolverName },
  { setPaginationInput, paginationInput, initialPaginationInput },
  queryResult: UseQueryState<TData>
): MultiQueryResult<TModel> => {
  //console.log('returnedProps', returnedProps);

  // workaround for https://github.com/apollographql/apollo-client/issues/2810
  const graphQLErrors = get(queryResult, "error.networkError.result.errors");
  // const { refetch, networkStatus, error, fetchMore, data, loading, variables } =
  const { data, error, fetching: loading } =
    queryResult;
  // Note: Scalar types like Dates are NOT converted. It should be done at the UI level.
  // We are foreced to recast because resolverName is dynamic, so we cannot type "data" correctly yet
  const documents = data?.[resolverName]?.results as Array<TModel> | undefined;
  const totalCount = data?.[resolverName]?.totalCount as number | undefined;
  // see https://github.com/apollographql/apollo-client/blob/master/packages/apollo-client/src/core/networkStatus.ts
  // const loadingInitial = networkStatus === 1;
  // const loadingMore = networkStatus === 3 || networkStatus === 2;

  return {
    ...queryResult,
    // see https://github.com/apollostack/apollo-client/blob/master/src/queries/store.ts#L28-L36
    // note: loading will propably change soon https://github.com/apollostack/apollo-client/issues/831
    // loadingInitial,
    // loadingMore,
    documents,
    totalCount,
    networkError: error && error.networkError,
    graphQLErrors,
    count: documents && documents.length,

    /**
     * User friendly wrapper around fetchMore
     * NOTE: this feature is not compatible with polling
     * @param providedInput
     */
    /*
    loadMore() {
      if (!documents) {
        if (loading) {
          throw new Error(
            "Called loadMore while documents were still loading. Please wait for the first documents to be loaded before loading more"
          );
        } else {
          throw new Error(
            "No 'documents' were returned by initial query (it probably failed with an error), impossible to call loadMore"
          );
        }
      }
      // get terms passed as argument or else just default to incrementing the offset
      // TODO: can't poll anymore
      // if (options.pollInterval)
      //   throw new Error("Can't call loadMore when polling is set.");
      const offsetVariables = merge({}, variables, {
        input: {
          offset: documents.length,
        },
      });

      return fetchMore({
        variables: offsetVariables,
        updateQuery: fetchMoreUpdateQuery(resolverName),
      });
    },*/

    fragmentName,
    fragment,
    data,
  };
};

interface UseMultiOptions<TModel, TData, TVariables>
  /* extends UseQueryArgs<TVariables, TData>*/ {
  model: VulcanGraphqlModel;
  input?: MultiInput<TModel>;
  fragment?: string | DocumentNode;
  fragmentName?: string;
  extraQueries?: string; // Get more data alongside the objects
  queryOptions?: any;//UseQueryArgs<TVariables, TData>;
} // & useQuery options?

export interface MultiQueryResult<TModel = any, TData = any>
  extends UseQueryState<TData> {
  graphQLErrors: any;
  // loadingInitial: boolean;
  // loadingMore: boolean;
  // loadMore: () => ReturnType<UseQueryState<TData>["fetchMore"]>;
  //loadMoreInc: Function;
  totalCount?: number;
  count?: number;
  networkError?: any;
  graphqlErrors?: Array<any>;
  fragment: string;
  fragmentName: string;
  documents?: Array<TModel>;
}

export const useMulti = <TModel = any, TData = any>(
  options: UseMultiOptions<TModel, TData, MultiVariables>,
  props = {}
): MultiQueryResult<TModel, TData> => {
  const initialPaginationInput = getInitialPaginationInput(options, props);
  const [paginationInput, setPaginationInput] = useState(
    initialPaginationInput
  );

  let {
    model,
    fragment = model.graphql.defaultFragment,
    fragmentName = model.graphql.defaultFragmentName,
    extraQueries,
  } = options;

  const { multiResolverName: resolverName } = model.graphql;

  // build graphql query from options
  const query = multiQuery({
    model,
    fragmentName,
    extraQueries,
    fragment,
  });

  const queryOptions = buildMultiQueryOptions<TModel, TData>(
    options,
    paginationInput,
    props
  );
  const [queryResult] = useQuery<TData>({ query, ...queryOptions });

  const result = buildMultiResult<TModel, TData, MultiVariables>(
    options,
    { fragment, fragmentName, resolverName },
    { setPaginationInput, paginationInput, initialPaginationInput },
    queryResult
  );

  return result;
};
