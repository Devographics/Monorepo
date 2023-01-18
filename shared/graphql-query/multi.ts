/*

Differences with Vulcan Meteor:

- use models instead of collections, to stay isomorphic
- do not accept references for models and fragments (eg collectionName), you have to get the actual value beforehand
- no pattern to get settings: you have to pass the polling option each time (or create your own useMulti that extends this one). Defaults can't be overriden globally.
- deprecate "propertyName" => with hooks you can rename when consuming the hook instead
- automated pluralization is forbidden, eg in graphql templates 
=> user has to provide a multiTypeName in the model (could be improved but automated pluralization must be avoided)
*/

import {
  MultiInput,
} from "@vulcanjs/graphql";
import merge from "lodash/merge.js";

// default query input object
const defaultInput = {
  limit: 20,
  enableTotal: true,
  enableCache: false,
};


/**
 * Build the graphQL query options
 * @param {*} options
 * @param {*} state
 * @param {*} props
 */
export const buildMultiQueryOptions = <TModel, TData>(
  options: any,
  paginationInput: any = {},
  props: any
): Partial<any> => {//UseQueryArgs<MultiVariables, TData>> => {
  // let pollInterval: number | null = null;
  let {
    input: optionsInput,
    // generic graphQL options
    queryOptions = {},
  } = options;
  // pollInterval = options.pollInterval ?? 20000; // nullish coalescing will keep the value 0, to deactivate polling explicitely

  // get dynamic input from props
  const { input: propsInput = {} } = props;

  // merge static and dynamic inputs
  const input = merge({}, optionsInput, propsInput);

  // if this is the SSR process, set pollInterval to null
  // see https://github.com/apollographql/apollo-client/issues/1704#issuecomment-322995855
  // pollInterval = typeof window === "undefined" ? null : pollInterval;

  // get input from options, then props, then pagination
  // TODO: should be done during the merge with lodash
  const mergedInput: MultiInput = {
    ...defaultInput,
    ...options.input,
    ...input,
    ...paginationInput,
  };

  const graphQLOptions: Partial<any> = {//UseQueryArgs<MultiVariables, TData>> = {
    variables: {
      input: mergedInput,
    },
    // TODO: not sure how to poll with urql
    // note: pollInterval can be set to 0 to disable polling (20s by default)
    // pollInterval: pollInterval ?? undefined,
  };

  // see https://www.apollographql.com/docs/react/features/error-handling/#error-policies
  // queryOptions.errorPolicy = "all";

  return {
    ...graphQLOptions,
    ...queryOptions, // allow overriding options
  };
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
