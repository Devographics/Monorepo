import { QueryHookOptions, useQuery } from "@apollo/client";
import gql from "graphql-tag";
import type { Entity } from "@devographics/core-models";
const entitiesQuery = gql`
  query EntitiesQuery(
    $tags: [String]
    $name: String_Selector
    $id: String_Selector
  ) {
    entities(tags: $tags, name: $name, id: $id) {
      name
      id
      type
      category
      description
      tags
      mdn
      twitterName
      twitter {
        userName
        avatarUrl
      }
      company {
        name
        homepage {
          url
        }
      }
    }
  }
`;

interface EntitiesQueryVariables {
  id?: {
    _in?: Array<string>;
  };
  name?: {
    _like?: Array<string>;
  };
}
export const useEntitiesQuery = (
  variables?: EntitiesQueryVariables,
  options?: QueryHookOptions
) =>
  useQuery<{ entities: Array<Entity> }>(entitiesQuery, {
    variables,
    ...(options || {}),
  });
