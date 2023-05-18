"use client";
import { useState } from "react";
import FormControl from "react-bootstrap/FormControl";
import { FormInputProps } from "~/components/form/typings";
import { FormItem } from "~/components/form/FormItem";
import debounce from "lodash/debounce.js";

export const FormComponentText = (props: FormInputProps) => {
  const {
    path,
    value: value_,
    question,
    updateCurrentValues,
    readOnly,
  } = props;

  const value = value_ as string | number;

  const [localValue, setLocalValue] = useState(value);

  const updateCurrentValuesDebounced = debounce(updateCurrentValues, 500);

  const handleChange = (event) => {
    setLocalValue(event.target.value);
    updateCurrentValues({ [path]: event.target.value });
  };

  const handleChangeDebounced = (event) => {
    setLocalValue(event.target.value);
    updateCurrentValuesDebounced({ [path]: event.target.value });
  };

  return (
    <FormItem {...props}>
      <FormControl
        type="text"
        value={localValue}
        onChange={handleChangeDebounced}
        onBlur={handleChange}
        disabled={readOnly}
      />
    </FormItem>
  );
};

export default FormComponentText;
