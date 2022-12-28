/**
 * Differences with Vulcan Meteor:
 * - No more "propertyName" option, data are returned in the "document" shortcut
 */
import _merge from "lodash/merge.js";

import {
  singleClientTemplate,
  VulcanGraphqlModel,
  SingleInput,
  getModelFragment,
  Fragment,
} from "@vulcanjs/graphql";

import { computeQueryVariables } from "./variables";
import {
  //OperationVariables,
  useQuery,
  UseQueryState,
  UseQueryArgs
  // QueryResult,
  // QueryHookOptions,
} from "urql";
import gql from "graphql-tag";

const defaultInput = {
  enableCache: false,
  allowNull: false,
};

/**
 * GraphQL query for a single query
 * @param param0
 * @returns
 */
export const buildSingleQuery = ({
  model,
  fragmentName,

  fragment,
  extraQueries,
}: {
  model: VulcanGraphqlModel;
  //typeName: string;
  /** @deprecated Prefer passing a fragment using gql tag, name will be computed automatically */
  fragmentName?: string;
  fragment?: Fragment;
  extraQueries?: string;
}) => {
  const { typeName } = model.graphql;
  const { finalFragment, finalFragmentName } = getModelFragment({
    model,
    fragment,
    fragmentName,
  });
  const query = gql`
    ${singleClientTemplate({
    typeName,
    fragmentName: finalFragmentName,
    extraQueries,
  })}
    ${finalFragment}
  `;
  return query;
};

/**
 * Create GraphQL useQuery options and variables based on props and provided options
 * @param {*} options
 * @param {*} props
 */
const buildQueryOptions = <TData = any, TVariables = any>(
  options: UseSingleOptions<any, TData, TVariables>,
  props
): Partial<UseQueryArgs<TVariables, TData>> => {
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
  queryResult: UseQueryState<TData>
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
  return result;
};

interface SingleResult<TModel = any, TData = any> extends UseQueryState<TData> {
  fragmentName: string;
  fragment: string;
  document: TModel; // shortcut to get the document
}
export interface UseSingleOptions<TModel, TData = any, TVariables = any> {
  model: VulcanGraphqlModel;
  input?: SingleInput<TModel>;
  fragment?: Fragment;
  fragmentName?: string;
  extraQueries?: string;
  queryOptions?: UseQueryArgs<TVariables, TData>;
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

  const [queryResult] = useQuery<TData>({ query, ...buildQueryOptions(options, props) });
  const result = buildSingleResult<TModel>(
    options,
    { fragment, fragmentName, resolverName },
    queryResult
  );
  return result;
};
