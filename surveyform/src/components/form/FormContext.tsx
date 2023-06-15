"use client";
import { createContext, useContext } from "react";

export const FormContext = createContext(undefined);

export const useFormContext = () => {
  const formContext = useContext(FormContext);
  if (!formContext)
    throw new Error(
      `A component is trying to access form context but it is undefined. Please wrap your component with a <Form>.
      You may be importing "FormContext" from different packages or have accidentaly made a copy of it?`
    );
  return formContext;
};
