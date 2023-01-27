/**
 * NOTE: KEEP SEPARATED FROM THE HOOKS TO CONSUME THE CONTEXT
 * otherwise you'll end up with circular dependencies because of the default components
 */
// TODO: we might need to adapt the provider to merge its value with a potentially higher up context
import React from "react";

import { PossibleVulcanComponents } from "./typings";
import { VulcanComponentsContext } from "./Context";
import { useVulcanComponents } from "./Consumer";
import { debugVulcan } from "@vulcanjs/utils";
const debugComponents = debugVulcan("components"); //console.log;

/**
 *
 * @param options.value An object of Vulcan components to be overriden.
 */
export const VulcanComponentsProvider = ({
  value,
  ...props
}: {
  value?: Partial<PossibleVulcanComponents>;
  children: React.ReactNode;
}) => {
  const currentComponents = useVulcanComponents();
  debugComponents(
    "Current components __not_initialized?",
    currentComponents.__not_initialized
  );
  const mergedComponents = {
    // merge with a parent Provider if needed
    ...(currentComponents?.__not_initialized ? {} : currentComponents || {}),
    ...(value || {}),
  };
  debugComponents("Merged components", mergedComponents);
  // For preserving displayName, that is lost after build somehow
  Object.keys(mergedComponents).forEach((componentName) => {
    if (mergedComponents[componentName]) {
      mergedComponents[componentName].displayName = "Vulcan." + componentName;
    } else {
      console.warn(`Encountered an undefined component: ${componentName}.
      The component may not be registered, or import failed.
      For instance due to an infinite import loop when importing
      "useVulcanComponents" from index instead of Consumer.`);
    }
  });
  return (
    <VulcanComponentsContext.Provider
      // We make the assumption that all components are there, user is responsible
      // for adding them correctly in the context where necessary
      value={mergedComponents as PossibleVulcanComponents} // merge provided components so the user can provide only a partial replacement
      {...props}
    />
  );
};
