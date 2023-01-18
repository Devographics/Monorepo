import { MutationButton } from "../../core/MutationButton";
import { Form, FormContainer } from "../../form/core";
import { PossibleFormComponents } from "../typings";

export const defaultFormComponents: Partial<PossibleFormComponents> = {
  Form,
  SmartForm: FormContainer,
};
// All those components are defined in each relevant package instead
export const defaultDatatableComponents = {};
export const defaultCellComponents = {};
