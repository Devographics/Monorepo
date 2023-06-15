import type { MouseEventHandler } from "react";
import type { VulcanCoreInput } from "@vulcanjs/schema";
import type { PossibleVulcanComponents } from "../VulcanComponents/typings";
import type {
  VulcanFieldSchema,
  VulcanFieldInput,
  VulcanFieldType,
} from "@vulcanjs/schema";

export interface FormComponentProps<TField = any>
  extends Omit<FormField, "type"> {
  document: any;
  /**
   * Legacy type was Array<{type: Number | String | Boolean} = the "type" of a SimpleSchema object
   * Now it's just the type from the JSON schema:
   */
  datatype: VulcanFieldType; // TODO: type of the field, replace this by a cleaner value like we do in graphql to get the field type
  disabled: boolean;
  errors: Array<any>;
  /** Help text for the form */
  help?: string;
  /** Path of the field if nested */
  path: string;
  defaultValue?: TField;
  max?: number;
  locale?: string;
  /** Input for this field */
  input?: VulcanFieldInput | string | React.Component;
  formType: "new" | "edit"; // new or edit
  intlInput?: boolean;
  nestedInput?: boolean;
  /** Graphql query you can pass to fetch the options asynchronously */
  query?: string;
  options?: Array<FormOption> | ((fciProps?: any) => Array<FormOption>);
  vulcanComponents?: PossibleVulcanComponents;
}

// Parsed version of the field, easier to display
export interface FormField extends VulcanFieldSchema {
  name: string; // = the field key name  in the schema
  path?: string;
  datatype: any; // ?
  itemDatatype?: any; // TODO: we may reuse the logic from the graphql generator to get the type of a schema field
  intlKeys?: Array<string>;
  document?: any;
  options?: any;
  intlInput?: boolean;
  help?: string;
  layout?: "horizontal" | "vertical";
}

export type FormType = "new" | "edit";

export type FormOption<TField = any> = {
  label: string;
  value: TField;
  /** Can force a default value */
  checked?: boolean;
  /**
   * Translated option
   */
  intlId?: string;
  /**
   * Non clickable option (visual clue)
   */
  disabled?: boolean;
};

/**
 * Props of the component that wraps inputs
 */
export interface FormComponentInnerProps extends FormComponentProps {
  inputType: VulcanCoreInput;
  //disabled?: boolean;
  // help?: string;
  /**
   * Callback called when clicking on the "clear input" button
   */
  clearField?: MouseEventHandler<HTMLButtonElement>;
  /**
   * TODO: not sure if it should be mandatory or not (eg for uncontrolled components?)
   */
  handleChange?: Function;
  itemProperties?: any;
  description?: string;
  loading?: boolean;
  submitForm: any;
  formComponents: PossibleVulcanComponents;
  intlKeys?: any;
  inputClassName: any;
  name?: string;
  input: any;
  beforeComponent: any;
  afterComponent: any;
  errors: any;
  showCharsRemaining: any;
  charsRemaining: any;
  renderComponent: any;
  formInput: any;
}
/**
 * Props passed to Vulcan Smart Form input
 * Use those props to define custom inputs
 */
export interface FormInputProps<TInput = HTMLInputElement>
  extends FormComponentInnerProps {
  // TODO: note sure about this, there also seems to be label and other props that are not HTMLInput props per se
  // It may depend on the type of input as well, maybe the type is more an union
  /**
   * Input properties will contain all props that can be safely passed down to the root input
   * (often an HTML "input" or textarea)
   *
   * This includes the current "value", that can be obtained either from "props" or "props.inputProperties.value"
   * in input components
   */
  inputProperties: React.HTMLProps<TInput>;
  itemProperties: any; // TODO
}
export type FormTextAreaProps = FormInputProps<HTMLTextAreaElement>;
