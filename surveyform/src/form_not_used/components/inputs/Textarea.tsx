"use client";
// import type { FormInputProps } from "@devographics/react-form";
import { useState } from "react";
import FormControl from "react-bootstrap/FormControl";
import debounce from "lodash/debounce.js";
import { FormItem } from "~/form_not_used/components/elements/FormItem";

export const FormComponentTextarea = (
  {
    path,
    label,
    refFunction,
    inputProperties = {},
    itemProperties = {},
  }: any /*FormInputProps*/
) => {
  const { onChange, value } = inputProperties;
  const [localValue, setLocalValue] = useState(value);

  const onChangeDebounced = debounce(onChange, 500);

  const handleChange = (event) => {
    setLocalValue(event.target.value);
    if (onChange) {
      onChange(event);
    }
  };

  const handleChangeDebounced = (event) => {
    setLocalValue(event.target.value);
    onChangeDebounced(event);
  };

  return (
    <FormItem path={path} label={label} {...itemProperties}>
      <FormControl
        // @ts-ignore
        as="textarea"
        ref={refFunction}
        {...inputProperties}
        // @ts-ignore
        value={localValue}
        onChange={handleChangeDebounced}
        onBlur={handleChange}
      />
    </FormItem>
  );
};

export default FormComponentTextarea;
