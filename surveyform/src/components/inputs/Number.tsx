"use client";
import { useState } from "react";
import FormControl from "react-bootstrap/FormControl";
import { FormInputProps } from "~/components/form/typings";
import { FormItem } from "~/components/form/FormItem";
import debounce from "lodash/debounce.js";
import { T } from "@devographics/react-i18n";

const checkIsValid = (rawValue) =>
  !isNaN(Number(rawValue)) && Number(rawValue) >= 0;

const getLocalValue = (value: number) => value ?? "";

export const FormComponentNumber = (props: FormInputProps) => {
  const {
    path,
    value: value_,
    question,
    updateCurrentValues,
    readOnly,
  } = props;

  const { units } = question;

  const value = value_ as number;

  const [localValue, setLocalValue] = useState(getLocalValue(value));

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
      <div className="form-input-number-wrapper">
        <FormControl
          // type="number"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={localValue}
          onChange={handleChangeDebounced}
          onBlur={handleChange}
          disabled={readOnly}
          className="form-input-number"
        />
        {units && <T token={`general.numeric_input.unit.${units}`} />}
      </div>

      {!checkIsValid(localValue) && (
        <FormControl.Feedback type="invalid">
          <T token="general.numeric_input.invalid_input" />
        </FormControl.Feedback>
      )}
    </FormItem>
  );
};

export default FormComponentNumber;
