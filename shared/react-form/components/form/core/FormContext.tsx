import React, { useContext } from "react";
import { AddSubmitCallbacks } from "./Form/hooks";

interface FormContextValue extends AddSubmitCallbacks {
  clearForm: Function;
  clearFieldErrors: Function;
  currentValues: object;
  deletedValues: Array<any>;
  errors: Array<any>;
  getDocument: Function;
  getLabel: (fieldName: string, fieldLocale?: string) => string;
  initialDocument: object;
  isChanged: boolean;
  refetchForm: Function;
  throwError: Function;
  updateCurrentValues: Function;
  disabled: boolean;
  addToDeletedValues: Function;
}

export const FormContext = React.createContext<FormContextValue | undefined>(
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
