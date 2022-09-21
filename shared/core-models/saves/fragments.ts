//registerFragment(/* GraphQL */

import gql from "graphql-tag";

export const SaveFragment = gql`
  fragment SaveFragment on Save {
    _id
    createdAt
    startedAt
    finishedAt
    responseId
    duration
  }
`;
