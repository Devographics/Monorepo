"use client";
/**
 * Part of the form context that does move:
 * mutation functions, response...
 * Using a context allows us to consume those methods per-component
 * and avoids unexpected renders due to prop drilling
 *
 * A state change in a context will NOT rerender all the context children
 * contrary to a normal component
 * Only children that actually need the state will rerender
 */
import { ResponseDocument } from "@devographics/types";
import { createContext, useContext } from "react";
import { useFormPropsContext } from "./FormPropsContext";
import { FormUpdateContext } from "./FormUpdateContext";
import { FormState, useFormState } from "./useFormState";

export const FormStateContext = createContext<
  // updateCurrentValues is in a separate handler, so we can update those values without rerendering systematicall
  FormState | undefined
>(undefined);

export const FormStateContextProvider = (props: {
  response?: ResponseDocument;
  children: React.ReactNode;
}) => {
  const { response: originalResponse, children } = props;
  const { readOnly } = useFormPropsContext();
  /**
   * By tying this state to a context provider
   * instead of a React component
   * We prevent rerendering the whole tree on any change
   * only components that subscribe to this context do update
   *
   * TODO: we might need to split this context into different pieces later on
   * namely to split FormProps vs FormState
   */
  const formState = useFormState({
    originalResponse,
    readOnly,
  });
  return (
    <FormStateContext.Provider value={formState}>
      <FormUpdateContext.Provider
        value={{ updateCurrentValues: formState.updateCurrentValues }}
      >
        {children}
      </FormUpdateContext.Provider>
    </FormStateContext.Provider>
  );
};

/**
 * /!\ using this context will make the component/input
 * rerender on every global state change
 * @returns
 */
export const useFormStateContext = () => {
  const formContext = useContext(FormStateContext);
  if (!formContext)
    throw new Error(
      `A component is trying to access form state context but it is undefined. Please wrap your component with a <Form>.
      You may be importing "FormContext" from different packages or have accidentaly made a copy of it?`
    );
  return formContext;
};
