"use client";
import { useState } from "react";
import FormControl from "react-bootstrap/FormControl";
import { FormInputProps } from "~/components/form/typings";
import { FormItem } from "~/components/form/FormItem";
import debounce from "lodash/debounce.js";
import { FormattedMessage } from "../common/FormattedMessage";

const checkIsValid = (rawValue) =>
  !isNaN(Number(rawValue)) && Number(rawValue) >= 0;

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

  const handleChange = (event) => {
    const rawValue = event.target.value;
    setLocalValue(rawValue);
    if (checkIsValid(rawValue)) {
      updateCurrentValues({
        [path]: rawValue === "" ? null : Number(rawValue),
      });
    }
  };

  const handleChangeDebounced = (event) => {
    const rawValue = event.target.value;
    setLocalValue(rawValue);
    if (checkIsValid(rawValue)) {
      updateCurrentValuesDebounced({
        [path]: rawValue === "" ? null : Number(rawValue),
      });
    }
  };

  return (
    <FormItem {...props} isInvalid={!checkIsValid(localValue)}>
      <FormControl
        type="number"
        value={localValue}
        onChange={handleChangeDebounced}
        onBlur={handleChange}
        disabled={readOnly}
        className="form-input-number"
      />
      {!checkIsValid(localValue) && (
        <FormControl.Feedback type="invalid">
          <FormattedMessage id="general.numeric_input.invalid_input" />
        </FormControl.Feedback>
      )}
    </FormItem>
  );
};

export default FormComponentNumber;
