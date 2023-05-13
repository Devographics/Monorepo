"use client";
// import type { FormInputProps } from "@devographics/react-form";
import { useState } from "react";
import FormControl from "react-bootstrap/FormControl";
import debounce from "lodash/debounce.js";
import { FormItem } from "~/surveys/components/form/FormItem";
import { FormInputProps } from "~/surveys/components/form/typings";

export const FormComponentTextarea = (props: FormInputProps) => {
  const { path, value, question, updateCurrentValues } = props;

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
        as="textarea"
        // ref={refFunction}
        value={localValue}
        onChange={handleChangeDebounced}
        onBlur={handleChange}
      />
    </FormItem>
  );
};

export default FormComponentTextarea;
