"use client";
import { createContext, useContext } from "react";
import { AddSubmitCallbacks } from "./Form/hooks";

interface FormContextValue extends AddSubmitCallbacks {
  clearForm: any;
  clearFieldErrors: any;
  currentValues: object;
  deletedValues: Array<any>;
  errors: Array<any>;
  getDocument: any;
  getLabel: (fieldName: string, fieldLocale?: string) => string;
  initialDocument: object;
  isChanged: boolean;
  refetchForm: any;
  throwError: any;
  updateCurrentValues: any;
  disabled: boolean;
  addToDeletedValues: any;
}

export const FormContext = createContext<FormContextValue | undefined>(
  undefined
);

export const useFormContext = () => {
  const formContext = useContext(FormContext);
  if (!formContext)
    throw new Error(
      `A component is trying to access form context but it is undefined. Please wrap your component with a <Form>.
      You may be importing "FormContext" from different packages or have accidentaly made a copy of it?
      FormContext is exposed by "@vulcanjs/react-ui".`
    );
  return formContext;
};
