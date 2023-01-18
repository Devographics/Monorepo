import React from "react";
export interface DummyProps { }

export const Dummy = () => (
  <span>
    You have not setup VulcanComponentsProvider. Please add following code in
    your app:{" "}
    <code>{`import { VulcanComponentsProvider } from "@vulcanjs/react-ui"; const YourApp = <VulcanComponentsProvider>{/* your app */}</VulcanComponentsProvider>;}`}</code>
  </span>
);
