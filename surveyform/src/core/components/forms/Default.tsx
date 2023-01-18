import { FormInputProps } from "@devographics/react-form";
import React from "react";
import { FormControl } from "react-bootstrap";
import { FormItem } from "../survey/questions/FormItem";

export const FormComponentText = ({
  path,
  label,
  refFunction,
  inputProperties = {},
  itemProperties = {},
}: FormInputProps & any) => {
  return (
    <FormItem path={path} label={label} {...itemProperties}>
      {/** @ts-ignore the "as" prop is problematic */}
      <FormControl {...inputProperties} ref={refFunction} type="text" />
    </FormItem>
  );
};
