"use client";
import { useState } from "react";
import { FormInputProps } from "~/components/form/typings";
import { FormItem } from "~/components/form/FormItem";
import debounce from "lodash/debounce.js";
import Form from "react-bootstrap/Form";
import { T } from "@devographics/react-i18n";
import { FormFeedback } from "../form/FormFeedback";

const lessThanOneYearValue = 0.5;

enum RadioValues {
  LESS_THAN_ONE_YEAR = "lessThanOneYear",
  MORE_THAN_ONE_YEAR = "moreThanOneYear",
}

const getRadioValue = (value: number) =>
  value
    ? Number(value) < 1
      ? RadioValues.LESS_THAN_ONE_YEAR
      : RadioValues.MORE_THAN_ONE_YEAR
    : null;

const getLocalValue = (value: number) =>
  !value || Number(value) < 1 ? "" : value;

const getcheckClass = (optionId: string, radioValue: string | null) =>
  radioValue
    ? radioValue === optionId
      ? "form-check-checked"
      : "form-check-unchecked"
    : "";

const checkIsValid = (rawValue) =>
  !isNaN(Number(rawValue)) && Number(rawValue) >= 0;

export const FormComponentYears = (props: FormInputProps) => {
  const {
    value: value_,
    path,
    updateCurrentValues,
    edition,
    question,
    readOnly,
  } = props;

  const value = value_ as number;

  const disabled = readOnly;

  const [radioValue, setRadioValue] = useState<RadioValues | null>(
    getRadioValue(value)
  );
  const [localValue, setLocalValue] = useState(getLocalValue(value));

  const updateCurrentValuesDebounced = debounce(updateCurrentValues, 500);

  const handleChange = (event) => {
    const rawValue = event.target.value;
    setRadioValue(RadioValues.MORE_THAN_ONE_YEAR);
    setLocalValue(rawValue);
    if (checkIsValid(rawValue)) {
      updateCurrentValues({
        [path]: rawValue === "" ? null : Number(rawValue),
      });
    }
  };

  const handleChangeDebounced = (event) => {
    const rawValue = event.target.value;
    setRadioValue(RadioValues.MORE_THAN_ONE_YEAR);
    setLocalValue(rawValue);
    if (checkIsValid(rawValue)) {
      updateCurrentValuesDebounced({
        [path]: rawValue === "" ? null : Number(rawValue),
      });
    }
  };

  const radioProps = {
    path,
    value,
    radioValue,
    setRadioValue,
    setLocalValue,
    updateCurrentValues,
    disabled,
  };

  return (
    <FormItem {...props} isInvalid={!checkIsValid(localValue)}>
      <FormCheck type="radio" className="form-input-lessThanOneYear">
        <FormCheckLabel htmlFor={`${path}.0`}>
          <LessThanOneYearRadio
            {...radioProps}
            isChecked={radioValue === RadioValues.LESS_THAN_ONE_YEAR}
          />
          <Label labelId="years.less_than_one_year" />
        </FormCheckLabel>
      </FormCheck>
      <FormCheck type="radio" className="form-input-moreThanOneYear">
        <FormCheckLabel htmlFor={`${path}.1`}>
          <MoreThanOneYearRadio
            {...radioProps}
            isChecked={radioValue === RadioValues.MORE_THAN_ONE_YEAR}
          />

          <input
            // type="number"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={localValue}
            onChange={handleChangeDebounced}
            onBlur={handleChange}
            disabled={readOnly}
            className={
              "form-control form-input-number" + " " + checkIsValid(localValue)
                ? "is-valid"
                : "is-invalid"
            }
          />

          <Label labelId="years.years" />
        </FormCheckLabel>
      </FormCheck>

      <FormFeedback type="invalid">
        <T token="general.numeric_input.invalid_input" />
      </FormFeedback>
    </FormItem>
  );
};

const LessThanOneYearRadio = ({
  path,
  isChecked,
  value,
  radioValue,
  setRadioValue,
  setLocalValue,
  updateCurrentValues,
  disabled,
}) => (
  <div className="form-input-wrapper">
    <FormCheckInput
      type="radio"
      value={RadioValues.LESS_THAN_ONE_YEAR}
      name={path}
      id={`${path}.0`}
      checked={isChecked}
      className={getcheckClass(RadioValues.LESS_THAN_ONE_YEAR, radioValue)}
      onClick={(e) => {
        if (isChecked) {
          // if this is checked, uncheck it and set question value to null
          setRadioValue(null);
          updateCurrentValues({ [path]: null });
        }
      }}
      onChange={(e) => {
        setRadioValue(RadioValues.LESS_THAN_ONE_YEAR);
        setLocalValue("");
        updateCurrentValues({ [path]: lessThanOneYearValue });
      }}
      disabled={disabled}
    />
  </div>
);

const MoreThanOneYearRadio = ({
  path,
  isChecked,
  value,
  radioValue,
  setRadioValue,
  setLocalValue,
  updateCurrentValues,
  disabled,
}) => (
  <div className="form-input-wrapper">
    <FormCheckInput
      type="radio"
      value={RadioValues.MORE_THAN_ONE_YEAR}
      name={path}
      id={`${path}.1`}
      checked={isChecked}
      className={getcheckClass(RadioValues.MORE_THAN_ONE_YEAR, radioValue)}
      onClick={(e) => {
        if (isChecked) {
          // if this is checked, uncheck it and set question value to null
          setRadioValue(null);
          setLocalValue("");
          updateCurrentValues({ [path]: null });
        }
      }}
      onChange={(e) => {
        setRadioValue(RadioValues.MORE_THAN_ONE_YEAR);
        if (value === lessThanOneYearValue) {
          updateCurrentValues({ [path]: null });
        }
      }}
      disabled={disabled}
    />
  </div>
);

const Label = ({ labelId }) => (
  <div className="form-option">
    <div className="form-option-item">
      <span className="form-option-label">
        <T token={labelId} />
      </span>
    </div>
  </div>
);

export default FormComponentYears;
