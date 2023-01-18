import React from "react";
import type { PossibleVulcanComponents } from "./typings";
import { Dummy } from "./Dummy";

const dummyHandler = {
  get(target, property) {
    if (property in target) {
      return target[property];
    }
    console.log(
      `Property ${property} not in possible Vulcan components, returning Dummy`
    );
    return Dummy;
  },
};
// We need this to shut TypeScript up
// You should use the Provider to get the right default values
export const VulcanComponentsContext =
  React.createContext<PossibleVulcanComponents>(
    // @ts-ignore
    new Proxy(
      {
        __not_initialized: true,
      },
      dummyHandler
    )
  );

// Needed to guarantee that the exports stays named
VulcanComponentsContext.displayName = "VulcanComponentsContext";
