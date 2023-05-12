"use client";
import React from "react";
import { useIntlContext } from "@devographics/react-i18n";
import type { FormInputProps } from "~/surveys/components/form/typings";
import Form from "react-bootstrap/Form";

import { FormItem } from "~/surveys/components/form/FormItem";

export const FormComponentSelect = (props: FormInputProps) => {
  const { path, value, question, updateCurrentValues } = props;
  const { options, optionsAreNumeric } = question;
  const intl = useIntlContext();
  const emptyValue = "";
  const noneOption = {
    label: intl.formatMessage({ id: "forms.select_option" }),
    id: emptyValue,
    disabled: true,
  };
  let otherOptions = Array.isArray(options) && options.length ? options : [];
  const allOptions = [noneOption, ...otherOptions];
  return (
    <FormItem {...props}>
      <Form.Select
        // ref={refFunction}
        defaultValue={emptyValue}
        onChange={(e) => {
          updateCurrentValues(path, e.target.value);
        }}
      >
        {allOptions.map(({ id, ...rest }) => (
          <option key={id} value={id} {...rest}>
            {id}
          </option>
        ))}
      </Form.Select>
    </FormItem>
  );
};

export default FormComponentSelect;
