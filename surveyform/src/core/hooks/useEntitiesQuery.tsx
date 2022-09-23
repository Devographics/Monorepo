import { QueryHookOptions, useQuery } from "@apollo/client";
import gql from "graphql-tag";
import type { Entity } from "@devographics/core-models";

export const entitiesQuery = gql`
  query EntitiesQuery(
    $tags: [String]
    $ids: [String]
  ) {
    entities(tags: $tags, ids: $ids)
  }
`;

// legacy typed version

// export const entitiesQuery = gql`
//   query EntitiesQuery(
//     $tags: [String]
//     $ids: [String]
//   ) {
//     entities(tags: $tags, ids: $id) {
//       name
//       id
//       type
//       category
//       description
//       tags
//       mdn
//       twitterName
//       twitter {
//         userName
//         avatarUrl
//       }
//       company {
//         name
//         homepage {
//           url
//         }
//       }
//       example {
//         language
//         code
//       }
//     }
//   }
// `;

interface EntitiesQueryVariables {
  ids?: Array<string>;
  tags?: Array<string>;
}

export const useEntitiesQuery = (
  variables?: EntitiesQueryVariables,
  options?: QueryHookOptions
) =>
  useQuery<{ entities: Array<Entity> }>(entitiesQuery, {
    variables,
    ...(options || {}),
  });