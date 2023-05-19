"use client";
import { useState } from "react";
import FormControl from "react-bootstrap/FormControl";
import debounce from "lodash/debounce.js";
import { FormItem } from "~/components/form/FormItem";
import { FormInputProps } from "~/components/form/typings";

export const FormComponentTextarea = (props: FormInputProps) => {
  const { path, value, question, updateCurrentValues, readOnly } = props;

  const [localValue, setLocalValue] = useState(value as string);

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
        value={localValue}
        onChange={handleChangeDebounced}
        onBlur={handleChange}
        disabled={readOnly}
      />
    </FormItem>
  );
};

export default FormComponentTextarea;
