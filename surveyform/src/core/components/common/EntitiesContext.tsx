/**
 * Load entities only once top level to avoid multiple queries
 *
 * The loading state is retrieved by the consumer hook (this avoids having a global loading state
 * since entities are not used that often)
 * @param param0
 * @returns
 */
import React, { useContext } from "react";

import { Entity } from "@devographics/core-models";
import { useEntitiesQuery } from "~/core/hooks/useEntitiesQuery";

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
  surveyId,
}: {
  children: any;
  surveyId: string;
}) => {
  const res = useEntitiesQuery({ surveyId });
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
