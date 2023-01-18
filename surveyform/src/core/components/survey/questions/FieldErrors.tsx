import React from "react";
import { FormError } from "./FormError";

/**
 * Errors for one specif fields
 * @returns
 */
export const FieldErrors = ({
  errors,
}: {
  /**
   * Errors for this specific field only
   */
  errors: Array<any>;
}) => {
  return (
    <ul className="form-input-errors">
      {errors.map((error, index) => (
        <li key={index}>
          <FormError error={error} errorContext="field" />
        </li>
      ))}
    </ul>
  );
};
