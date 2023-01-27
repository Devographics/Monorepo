/**
 * Differences with Vulcan Meteor:
 * - No more "propertyName" option, data are returned in the "document" shortcut
 */
import _merge from "lodash/merge.js";
import {
  VulcanGraphqlModel,
  SingleInput,
  Fragment,
} from "@vulcanjs/graphql";
import { buildSingleQuery } from "@devographics/crud";

import { computeQueryVariables } from "./variables";
import {
  //OperationVariables,
  useQuery,
  UseQueryState,
  UseQueryArgs,
  UseQueryResponse
  // QueryResult,
  // QueryHookOptions,
} from "urql";

const defaultInput = {
  enableCache: false,
  allowNull: false,
};


/**
 * Create GraphQL useQuery options and variables based on props and provided options
 * @param {*} options
 * @param {*} props
 */
const buildQueryOptions = <TData = any, TVariables = any>(
  options: UseSingleOptions<any, TData, TVariables>,
  props
): any => {//Partial<UseQueryArgs<TVariables, TData>> => {
  // if this is the SSR process, set pollInterval to null
  // see https://github.com/apollographql/apollo-client/issues/1704#issuecomment-322995855
  /*const pollInterval =
    typeof window === "undefined"
      ? undefined
      : options?.queryOptions?.pollInterval ?? 20000;*/

  // @ts-ignore
  return {
    variables: {
      ...(computeQueryVariables(
        { ...options, input: _merge({}, defaultInput, options.input || {}) }, // needed to merge in defaultInput, could be improved
        props
      ) as TVariables),
    },
    // see https://www.apollographql.com/docs/react/features/error-handling/#error-policies
    // errorPolicy: "all",
    ...(options?.queryOptions || {}),
    // pollInterval, // note: pollInterval can be set to 0 to disable polling (20s by default)
  };
};

const buildSingleResult = <TModel = any, TData = any>(
  options: UseSingleOptions<TModel>,
  { fragmentName, fragment, resolverName },
  [queryResult, reexecuteQuery]: UseQueryResponse<any, any>,
): SingleResult<TData> => {
  const { /* ownProps, */ data, error } = queryResult;
  const result = {
    ...queryResult,
    // Note: Scalar types like Dates are NOT converted. It should be done at the UI level.
    document: data?.[resolverName]?.result,
    fragmentName,
    fragment,
  };
  if (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
  const refetch = () => {
    // Refetch the query and skip the cache
    reexecuteQuery({ requestPolicy: 'network-only' });
  };
  return { ...result, refetch, loading: result.fetching };
};

interface SingleResult<TModel = any, TData = any> extends UseQueryState<TData> {
  fragmentName: string;
  fragment: string;
  document: TModel; // shortcut to get the document
  refetch: () => void;
  loading: boolean
}
export interface UseSingleOptions<TModel, TData = any, TVariables = any> {
  model: VulcanGraphqlModel;
  input?: SingleInput<TModel>;
  fragment?: Fragment;
  fragmentName?: string;
  extraQueries?: string;
  queryOptions?: any//UseQueryArgs<TVariables, TData>;
}

/**
 * Fetch a single, known document
 * @param options
 * @param props
 */
export const useSingle = <TModel = any, TData = any>(
  options: UseSingleOptions<TModel>,
  props = {}
): SingleResult<TModel> => {
  let {
    model,
    fragment = model.graphql.defaultFragment,
    fragmentName = model.graphql.defaultFragmentName,
    extraQueries,
  } = options;

  const { singleResolverName: resolverName } = model.graphql;

  const query = buildSingleQuery({
    model,
    fragmentName,
    fragment,
    extraQueries,
  });

  const [queryResult, reexecuteQuery] = useQuery<TData>({ query, ...buildQueryOptions(options, props) });
  const result = buildSingleResult<TModel>(
    options,
    { fragment, fragmentName, resolverName },
    [queryResult, reexecuteQuery]
  );
  return result;
};
