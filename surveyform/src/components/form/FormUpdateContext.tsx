"use client";
/**
 * updateCurrentValues is in a separate context
 * so that component that do not need any other state
 * do not rerender when other inputs are modified
 */
import { createContext, useContext } from "react";
import { FormState } from "./useFormState";

export const FormUpdateContext = createContext<
  Pick<FormState, "updateCurrentValues"> | undefined
>(undefined);

export const useFormUpdateContext = () => {
  const formContext = useContext(FormUpdateContext);
  if (!formContext)
    throw new Error(
      `A component is trying to access form state context but it is undefined. Please wrap your component with a <Form>.
      You may be importing "FormContext" from different packages or have accidentaly made a copy of it?`
    );
  return formContext;
};
