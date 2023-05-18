"use client";
/**
 * Load entities only once top level to avoid multiple queries
 *
 * The loading state is retrieved by the consumer hook (this avoids having a global loading state
 * since entities are not used that often)
 * @param param0
 * @returns
 */
import { createContext, useContext } from "react";

import { Entity } from "@devographics/core-models";

const EntitiesContext = createContext<
  Array<Entity> | undefined // use empty array even if loading to avoid crash if not waiting for loading
>(undefined);

export const EntitiesProvider = ({
  children,
  entities,
}: {
  children: any;
  entities: Array<Entity>;
}) => {
  return (
    <EntitiesContext.Provider value={entities}>
      {children}
    </EntitiesContext.Provider>
  );
};

export const useEntities = () => {
  const entities = useContext(EntitiesContext);
  if (!entities) {
    throw new Error("Entity context not initialized");
  }
  return entities;
};

export default EntitiesContext;
