/**
 * Differences with Vulcan Meteor:
 * - No more "propertyName" option, data are returned in the "document" shortcut
 */
import _merge from "lodash/merge.js";

import {
  singleClientTemplate,
  VulcanGraphqlModel,
  getModelFragment,
  Fragment,
} from "@vulcanjs/graphql";
import gql from "graphql-tag";

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