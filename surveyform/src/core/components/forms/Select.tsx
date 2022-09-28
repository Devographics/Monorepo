import React from "react";
import { useIntlContext } from "@vulcanjs/react-i18n";
import { FormInputProps, useVulcanComponents } from "@vulcanjs/react-ui";
import type { FormOption } from "@vulcanjs/react-ui";
import Form from 'react-bootstrap/Form';

export const FormComponentSelect = ({
  path,
  label,
  refFunction,
  inputProperties,
  itemProperties,
  datatype,
  options,
}: FormInputProps<HTMLSelectElement>) => {
  const Components = useVulcanComponents();
  const intl = useIntlContext();
  // depending on field type, empty value can be '' or null
  const emptyValue = datatype === String || datatype === Number ? "" : undefined;
  const noneOption: FormOption<any> = {
    label: intl.formatMessage({ id: "forms.select_option" }),
    value: emptyValue,
    disabled: true,
  };
  let otherOptions = Array.isArray(options) && options.length ? options : [];
  const allOptions = [noneOption, ...otherOptions];
  // @ts-ignore
  const { options: deleteOptions, ...newInputProperties } = inputProperties;
  return (
    <Components.FormItem
      path={path}
      label={inputProperties.label}
      name={inputProperties.name}
      {...itemProperties}
    >
      <Form.Select
        {...newInputProperties}
        ref={refFunction}
      >
        {allOptions.map(({ value, label, intlId, ...rest }) => (
          <option key={value} value={value} {...rest}>
            {label}
          </option>
        ))}
      </Form.Select>
    </Components.FormItem>
  );
};

export default FormComponentSelect;
