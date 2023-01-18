import React from "react";
import { Button } from "~/core/components/ui/Button";
import { FieldErrors } from "../elements/FieldErrors";
import { IconAdd } from "./FormNestedArray";

// Replaceable layout, default implementation
export const FormNestedArrayLayout = (props) => {
  const {
    hasErrors,
    nestedArrayErrors,
    label,
    addItem,
    BeforeComponent,
    AfterComponent,
    children,
  } = props;
  return (
    <div
      className={`form-group row form-nested ${hasErrors ? "input-error" : ""}`}
    >
      {BeforeComponent && <BeforeComponent {...props} />}

      <label className="control-label col-sm-3">{label}</label>

      <div className="col-sm-9">
        {children}
        {addItem && (
          <Button
            className="form-nested-button form-nested-add"
            size="sm"
            variant="success"
            onClick={addItem}
          >
            <IconAdd height={12} width={12} />
          </Button>
        )}
        {props.hasErrors ? (
          <FieldErrors key="form-nested-errors" errors={nestedArrayErrors} />
        ) : null}
      </div>

      {AfterComponent && <AfterComponent {...props} />}
    </div>
  );
};

export default FormNestedArrayLayout;
