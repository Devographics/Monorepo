// /*

// Generic mutation wrapper to update a document in a collection.

// Sample mutation:

//   mutation updateMovie($input: UpdateMovieInput) {
//     updateMovie(input: $input) {
//       data {
//         _id
//         name
//         __typename
//       }
//       __typename
//     }
//   }

// Arguments:

//   - input
//     - input.selector: a selector to indicate the document to update
//     - input.data: the document (set a field to `null` to delete it)

// Child Props:

//   - updateMovie({ selector, data })

// */

import gql from "graphql-tag";

import {
  Fragment,
  getModelFragment,
  updateClientTemplate,
} from "@vulcanjs/graphql";

import type { VulcanGraphqlModel } from "@vulcanjs/graphql"; // TODO: import client code only


export const buildUpdateQuery = ({
  model,
  fragmentName,
  fragment,
}: {
  model: VulcanGraphqlModel;
  fragmentName?: string;
  fragment?: Fragment;
}) => {
  const { typeName } = model.graphql;
  const { finalFragment, finalFragmentName } = getModelFragment({
    model,
    fragment,
    fragmentName,
  });
  return gql`
    ${updateClientTemplate({ typeName, fragmentName: finalFragmentName })}
    ${finalFragment}
  `;
};