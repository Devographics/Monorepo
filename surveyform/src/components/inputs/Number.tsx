"use client";
import { useState } from "react";
import { FormInputProps } from "~/components/form/typings";
import { FormItem } from "~/components/form/FormItem";
import debounce from "lodash/debounce.js";
import { T } from "@devographics/react-i18n";
import { FormFeedback } from "../form/FormFeedback";

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
        <input
          // inputs of type number are not relevant in most case when field is not ordinal
          // so we use text + relevant attributes to make sure the input is numeric
          type="text"
          // So virtual keyboards on mobile devices default to numeric input
          inputMode="numeric"
          pattern="[0-9]*"
          value={localValue}
          onChange={handleChangeDebounced}
          onBlur={handleChange}
          disabled={readOnly}
          className="form-control form-input-number"
        />
        {units && <T token={`general.numeric_input.unit.${units}`} />}
      </div>

      {!checkIsValid(localValue) && (
        <FormFeedback type="invalid">
          <T token="general.numeric_input.invalid_input" />
        </FormFeedback>
      )}
    </FormItem>
  );
};

export default FormComponentNumber;
