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

import {
  createClientTemplate,
  getModelFragment,
  Fragment,
} from "@vulcanjs/graphql";
import { VulcanGraphqlModel } from "@vulcanjs/graphql";

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