"use client";
/**
 * Store the form props that do not change or that are not functions
 * = the edition, the section, section number...
 */
import {
  EditionMetadata,
  SectionMetadata,
  SurveyMetadata,
} from "@devographics/types";
import { createContext, useContext } from "react";

export interface FormProps {
  readOnly?: boolean;
  edition: EditionMetadata;
  sectionNumber: number;
  section: SectionMetadata;
  survey: SurveyMetadata;
}

// TODO: type this
export const FormPropsContext = createContext<FormProps | undefined>(undefined);

export const useFormPropsContext = () => {
  const formContext = useContext(FormPropsContext);
  if (!formContext)
    throw new Error(
      `A component is trying to access form props context but it is undefined. Please wrap your component with a <FormPropsContext.Provider>.
      You may be importing "FormContext" from different packages or have accidentaly made a copy of it?`
    );
  return formContext;
};
