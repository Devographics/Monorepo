import { deprecate } from "@vulcanjs/utils";
import React, { useContext, useEffect } from "react";
import { VulcanComponentsContext } from "./Context";

export const VulcanComponentsConsumer = VulcanComponentsContext.Consumer;

export const useVulcanComponents = () => {
  const val = useContext(VulcanComponentsContext);
  return val;
};

export const withVulcanComponents = (C) => (props) => {
  const vulcanComponents = useVulcanComponents();
  deprecate(
    "0.0.0",
    "Using withVulcanComponents HOC => prefer useVulcanComponents with hooks"
  );
  return <C vulcanComponents={vulcanComponents} {...props} />;
};
