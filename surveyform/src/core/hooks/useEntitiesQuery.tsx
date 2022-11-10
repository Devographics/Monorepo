import { QueryHookOptions, useQuery } from "@apollo/client";
import gql from "graphql-tag";
import type { Entity } from "@devographics/core-models";

export const entitiesQuery = gql`
  query EntitiesQuery(
    $surveyId: String
  ) {
    entities(surveyId: $surveyId)
  }
`;

interface EntitiesQueryVariables {
  surveyId: string;
}

export const useEntitiesQuery = (
  variables?: EntitiesQueryVariables,
  options?: QueryHookOptions
) =>
  useQuery<{ entities: Array<Entity> }>(entitiesQuery, {
    variables,
    ...(options || {}),
  });