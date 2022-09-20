//import { registerFragment } from 'meteor/vulcan:core';

import { getFragmentName } from "@vulcanjs/graphql";
import gql from "graphql-tag";
import { Response } from "./model";

const ResponsesDefaultFragment = gql`
  ${Response.graphql.defaultFragment}
`;

/**
 * /!\ this fragment is massive as it embeds all active surveys fragments
 */
export const ResponseFragment = gql`
  fragment ResponseFragment on Response {
    _id
    createdAt
    updatedAt

    pagePath

    ...${getFragmentName(ResponsesDefaultFragment)}

    user {
      _id
      displayName
      pagePath
    }
    userId

    survey {
      name
      year
      status
      slug
      prettySlug
    }
  }
  ${ResponsesDefaultFragment}
`;

/**
 * Doesn't include survey specific
 *
 * TODO: we probably need smth intermediate:
 * a fragment with only the current survey fields
 */
export const LightweightResponseFragment = gql`
  fragment ResponseFragment on Response {
    _id
    createdAt
    updatedAt

    pagePath

    user {
      _id
      displayName
      pagePath
    }
    userId

    survey {
      name
      year
      status
      slug
      prettySlug
    }
  }
`;

//registerFragment(/* GraphQL */
export const ResponseFragmentWithRanking = gql`
  fragment ResponseFragmentWithRanking on Response {
    ...${getFragmentName(ResponseFragment)}
    knowledgeRanking
  }
  ${ResponseFragment}
`;
//registerFragment(/* GraphQL */
export const ResponseAdminFragment = gql`
  fragment ResponseAdminFragment on Response {
    ...${getFragmentName(ResponseFragment)}

    completion

    normalizedResponse

    user {
      _id
      displayName
      pagePath
      email
    }
  }
  ${ResponseFragment}
`;

export const CreateResponseOutputFragment = gql`
  fragment CreateResponseOutputFragment on ResponseMutationOutput {
    data {
      ...${getFragmentName(LightweightResponseFragment)}
    }
  }
  ${ResponseFragment}
`;
