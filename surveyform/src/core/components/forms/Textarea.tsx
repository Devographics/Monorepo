"use client";
import { FormInputProps } from "@vulcanjs/react-ui";
import React, { useState } from "react";
import { FormControl } from "react-bootstrap";
import debounce from "lodash/debounce.js";
import { FormItem } from "~/core/components/survey/questions/FormItem";

export const FormComponentTextarea = ({
  path,
  label,
  refFunction,
  inputProperties = {},
  itemProperties = {},
}: FormInputProps) => {
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
        // @ts-expect-error
        as="textarea"
        ref={refFunction}
        {...inputProperties}
        // @ts-expect-error
        value={localValue}
        onChange={handleChangeDebounced}
        onBlur={handleChange}
      />
    </FormItem>
  );
};

export default FormComponentTextarea;
