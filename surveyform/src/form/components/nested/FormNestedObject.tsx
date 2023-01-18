import React from "react";
import _omit from "lodash/omit.js";
import { useFormContext } from "@devographics/react-form";
import { FormNestedItem } from "./FormNestedItem";
import { FieldErrors } from "../elements/FieldErrors";

// Replaceable layout
export const FormNestedObjectLayout = ({ hasErrors, label, content }) => (
  <div
    className={`form-group row form-nested ${hasErrors ? "input-error" : ""}`}
  >
    <label className="control-label col-sm-3">{label}</label>
    <div className="col-sm-9">{content}</div>
  </div>
);

interface FormNestedObjectProps {
  label?: string;
  value: any;
  input: any;
  inputProperties: any;
  nestedInput: any;
  errors: Array<any>;
  path: string;
}
export const FormNestedObject = (props: FormNestedObjectProps) => {
  //const value = this.getCurrentValue()
  // do not pass FormNested's own value, input and inputProperties props down
  const properties = _omit(
    props,
    "value",
    "input",
    "inputProperties",
    "nestedInput"
  );
  const { errors } = useFormContext();
  // only keep errors specific to the nested array (and not its subfields)
  const nestedObjectErrors = errors.filter(
    (error) => error.path && error.path === props.path
  );
  const hasErrors = nestedObjectErrors && nestedObjectErrors.length;
  return (
    <FormNestedObjectLayout
      hasErrors={hasErrors}
      label={props.label}
      content={[
        <FormNestedItem
          key="form-nested-item"
          {...properties}
          path={`${props.path}`}
        />,
        hasErrors ? (
          <FieldErrors key="form-nested-errors" errors={nestedObjectErrors} />
        ) : null,
      ]}
    />
  );
};

export default FormNestedObject;
