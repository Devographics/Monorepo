import React from "react";

export interface IntlContextType {
  locale: string;
  key: string;
  messages: Array<any>;
}
export const IntlContext = React.createContext<IntlContextType>({
  locale: "",
  key: "",
  messages: [],
});

export default IntlContext;
