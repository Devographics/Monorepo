import React, { ReactNode } from "react";
import FormControl from "react-bootstrap/FormControl";

// TODO

export const LoginFormItem = ({
  label,
  name,
  children,
}: {
  label: string | ReactNode;
  name: string;
  children: ReactNode;
}) => {
  return (
    <div className={`form-item ${name}`}>
      <label htmlFor={name}>{label}</label>
      {children}
    </div>
  );
};

interface FormComponentEmailProps {
  placeholder?: string;
  label?: string | ReactNode;
}

/**
 * Inspired by FormComponentEmail
 * that is used in the SmartForm
 */
export const FormComponentEmail = (props: FormComponentEmailProps) => {
  const { placeholder, label } = props;
  const name = "email";
  const componentProperties = {
    placeholder,
    name,
    id: name,
    type: "email",
    required: true,
    autoCorrect: "off",
    autoCapitalize: "none",
    label: placeholder,
  };

  return (
    // passing the name is important to get the right label
    <LoginFormItem label={label || name} name={name}>
      {/** @ts-ignore the "as" prop is problematic */}
      <FormControl {...componentProperties} />
    </LoginFormItem>
  );
};
