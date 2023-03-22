"use client";
import React from "react";
import { useIntlContext } from "@devographics/react-i18n";
import type { FormInputProps, FormOption } from "@devographics/react-form";
import Form from "react-bootstrap/Form";

import { FormItem } from "~/form/components/elements/FormItem";

export const FormComponentSelect = ({
  path,
  label,
  refFunction,
  inputProperties,
  itemProperties,
  datatype,
  options,
}: FormInputProps<HTMLSelectElement>) => {
  const intl = useIntlContext();
  // depending on field type, empty value can be '' or null
  const emptyValue =
    datatype === String || datatype === Number ? "" : undefined;
  const noneOption: FormOption<any> = {
    label: intl.formatMessage({ id: "forms.select_option" }),
    value: emptyValue,
    disabled: true,
  };
  let otherOptions = Array.isArray(options) && options.length ? options : [];
  const allOptions = [noneOption, ...otherOptions];
  // don't pass options to Form.Select
  // @ts-ignore
  const { options: deleteOptions, ...newInputProperties } = inputProperties;
  return (
    <FormItem
      path={path}
      label={inputProperties.label}
      name={inputProperties.name}
      {...itemProperties}
    >
      {/** React.HTMLProps will define a weird "as" string HTML attribute
       * I cannot find any documentation on it and its not standard HTML,
       * at least for inputs
       *
       */}
      {/** @ts-expect-error */}
      <Form.Select
        {...newInputProperties}
        ref={refFunction}
        defaultValue={emptyValue}
      >
        {allOptions.map(({ value, label, intlId, ...rest }) => (
          <option key={value} value={value} {...rest}>
            {label}
          </option>
        ))}
      </Form.Select>
    </FormItem>
  );
};

export default FormComponentSelect;
