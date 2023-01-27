/**
 * NOTE: KEEP SEPARATED FROM THE HOOKS TO CONSUME THE CONTEXT
 * otherwise you'll end up with circular dependencies because of the default components
 */
// TODO: we might need to adapt the provider to merge its value with a potentially higher up context
import React from "react";

import {
  VulcanCurrentUserContext,
  VulcanCurrentUserContextType,
} from "./Context";

// So that you can override only some components by adding an additional context while keeping the defaults
export const VulcanCurrentUserProvider = ({
  value,
  ...props
}: {
  value: VulcanCurrentUserContextType;
  children: React.ReactNode;
}) => (
  <VulcanCurrentUserContext.Provider
    value={value} // merge provided components so the user can provide only a partial replacement
    {...props}
  />
);
