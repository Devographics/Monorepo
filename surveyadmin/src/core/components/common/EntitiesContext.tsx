/**
 * Load entities only once top level to avoid multiple queries
 *
 * The loading state is retrieved by the consumer hook (this avoids having a global loading state
 * since entities are not used that often)
 * @param param0
 * @returns
 */
import React, { useContext } from "react";

import gql from "graphql-tag";
import { Entity } from "@devographics/core-models";
import { useQuery } from "~/lib/graphql";

const entitiesQuery = gql`
  query EntitiesQuery($tags: [String], $ids: [String]) {
    entities(tags: $tags, ids: $ids) {
      name
      id
      type
      category
      description
      tags
      mdn
      twitterName
      company {
        name
        homepage {
          url
        }
      }
    }
  }
`;

const useEntitiesQuery = ({ tags, ids }: { tags?: string[]; ids?: string[] }) =>
  useQuery<{ entities: Array<Entity> }>(entitiesQuery, {
    variables: { tags, ids },
  });

const EntitiesContext = React.createContext<{
  data: { entities: Array<Entity> }; // use empty array even if loading to avoid crash if not waiting for loading
  error?: Error;
  loading?: boolean;
}>({
  loading: true,
  data: { entities: [] },
});

export const EntitiesProvider = ({
  children,
  tags,
  ids,
}: {
  children: any;
  tags?: string[];
  ids?: string[];
}) => {
  const res = useEntitiesQuery({ tags, ids });
  const { loading, error, data } = res;
  const entities = data?.entities || [];
  return (
    <EntitiesContext.Provider value={{ loading, error, data: { entities } }}>
      {children}
    </EntitiesContext.Provider>
  );
};

export const useEntities = () => useContext(EntitiesContext);

export default EntitiesContext;
