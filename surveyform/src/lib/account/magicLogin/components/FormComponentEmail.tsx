import React, { ReactNode } from "react";

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
  return (
    // passing the name is important to get the right label
    <LoginFormItem label={label || name} name={name}>
      <input
        className="form-control"
        placeholder={placeholder}
        name="email"
        id={name}
        type={"email"}
        required={true}
        autoCorrect={"off"}
        autoCapitalize={"none"}
        // label={placeholder}
      />
    </LoginFormItem>
  );
};
