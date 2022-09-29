import type { FormInputProps } from "@vulcanjs/react-ui";
import React from "react";
import { FormControl } from "react-bootstrap";

/**
 * Inspired by @vulcanjs/react-ui-lite FormItem
 */
export const FormItem = ({
  label,
  name,
  children,
}: {
  label: string;
  name: string;
  children: React.ReactNode;
}) => {
  return (
    <div className={`form-item ${name}`}>
      <label htmlFor={name}>{label}</label>
      {children}
    </div>
  );
};

/**
 * Inspired by @vulcanjs/react-ui-bootstrap FormComponentEmail
 * that is used in the SmartForm
 */
export const FormComponentEmail = ({
  path,
  label,
  refFunction,
  inputProperties,
  itemProperties,
  name,
}: Partial<FormInputProps>) => {
  return (
    // passing the name is important to get the right label
    <FormItem path={path} label={label} name={name} {...itemProperties}>
      {/** @ts-ignore the "as" prop is problematic */}
      <FormControl
        name={name}
        id={name}
        {...inputProperties}
        ref={refFunction}
        type="email"
      />
    </FormItem>
  );
};
