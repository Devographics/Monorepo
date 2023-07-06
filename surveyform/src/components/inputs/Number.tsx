"use client";
import { useState } from "react";
import FormControl from "react-bootstrap/FormControl";
import { FormInputProps } from "~/components/form/typings";
import { FormItem } from "~/components/form/FormItem";
import debounce from "lodash/debounce.js";

export const FormComponentNumber = (props: FormInputProps) => {
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

  const getValue = (event) => {
    const rawValue = event.target.value;
    const value = rawValue === "" ? null : Number(rawValue);
    console.log(rawValue);
    console.log(value);
    return value;
  };

  const handleChange = (event) => {
    setLocalValue(event.target.value);
    updateCurrentValues({ [path]: getValue(event) });
  };

  const handleChangeDebounced = (event) => {
    setLocalValue(event.target.value);
    updateCurrentValuesDebounced({ [path]: getValue(event) });
  };

  return (
    <FormItem {...props}>
      <FormControl
        type="number"
        value={localValue}
        onChange={handleChangeDebounced}
        onBlur={handleChange}
        disabled={readOnly}
      />
    </FormItem>
  );
};

export default FormComponentNumber;
