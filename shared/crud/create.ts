// /*

// Generic mutation wrapper to insert a new document in a collection and update
// a related query on the client with the new item and a new total item count.

// Sample mutation:

//   mutation createMovie($data: CreateMovieData) {
//     createMovie(data: $data) {
//       data {
//         _id
//         name
//         __typename
//       }
//       __typename
//     }
//   }

// Arguments:

//   - data: the document to insert

// Child Props:

//   - createMovie({ data })

// */

import gql from "graphql-tag";

import { filterFunction } from "@vulcanjs/mongo/client";
import {
  createClientTemplate,
  getModelFragment,
  Fragment,
} from "@vulcanjs/graphql";

import { ComputeNewDataFunc } from "./multiQueryUpdater";

import { addToData, matchSelector } from "./cacheUpdate";

import debug from "debug";
import { VulcanGraphqlModel } from "@vulcanjs/graphql";
const debugApollo = debug("vn:apollo");
/**
 * Compute the new list after a create mutation
 * @param param0
 */
export const computeNewDataAfterCreate: ComputeNewDataFunc = async ({
  model,
  variables,
  queryResult,
  mutatedDocument,
  multiResolverName,
}) => {
  const newDoc = mutatedDocument;
  // get mongo selector and options objects based on current terms
  const multiInput = variables.input;
  // TODO: the 3rd argument is the context, not available here
  // Maybe we could pass the currentUser? The context is passed to custom filters function
  const filter = await filterFunction(model, multiInput, {});
  const { selector, options: paramOptions } = filter;
  const { sort } = paramOptions;
  debugApollo("Got query", queryResult, ", and filter", filter);
  // check if the document should be included in this query, given the query filters
  if (matchSelector(newDoc, selector)) {
    debugApollo("Document matched, updating the data");
    // TODO: handle order using the selector
    const newData = addToData({
      queryResult,
      multiResolverName,
      document: newDoc,
      sort,
      selector,
    });
    return newData;
  }
  return null;
};

export const buildCreateQuery = ({
  model,
  fragmentName,
  fragment,
}: {
  model: VulcanGraphqlModel;
  /**
   * @deprecated Prefer passing a fragment using gql tag, name will be computed automatically
   */
  fragmentName?: string;
  fragment?: Fragment;
}) => {
  const { typeName } = model.graphql;
  const { finalFragment, finalFragmentName } = getModelFragment({
    model,
    fragment,
    fragmentName,
  });
  const query = gql`
    ${createClientTemplate({ typeName, fragmentName: finalFragmentName })}
    ${finalFragment}
  `;
  return query;
};