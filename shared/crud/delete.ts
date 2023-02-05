/*

 Generic mutation wrapper to remove a document from a collection.

 Sample mutation:

   mutation deleteMovie($input: DeleteMovieInput) {
    deleteMovie(input: $input) {
      data {
        _id
        name
        __typename
      }
      __typename
    }
  }

 Arguments:

   - input
     - input.selector: the id of the document to remove

 Child Props:

   - deleteMovie({ selector })

 */

import gql from "graphql-tag";
import {
  deleteClientTemplate,
  Fragment,
  getModelFragment,
  VulcanGraphqlModel,
} from "@vulcanjs/graphql";

export const buildDeleteQuery = ({
  model,
  fragment,
  fragmentName,
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
    ${deleteClientTemplate({ typeName, fragmentName: finalFragmentName })}
    ${finalFragment}
  `;
};