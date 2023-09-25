"use client";
import { useEffect, useState } from "react";
import FormControl from "react-bootstrap/FormControl";
import { FormInputProps } from "~/components/form/typings";
import { FormItem } from "~/components/form/FormItem";
import debounce from "lodash/debounce.js";
import Form from "react-bootstrap/Form";
import { FormOption } from "~/components/form/FormOption";
import OtherOption from "./OtherOption";
import { getFormPaths } from "@devographics/templates";
import { FormattedMessage } from "../common/FormattedMessage";

const lessThanOneYear = "lessThanOneYear";
const moreThanOneYear = "moreThanOneYear";
const lessThanOneYearValue = 0.5;

const getRadioValue = (value: number) =>
  value ? (Number(value) < 1 ? lessThanOneYear : moreThanOneYear) : null;

const getLocalValue = (value: number) =>
  !value || Number(value) < 1 ? "" : value;

const getcheckClass = (optionId: string, radioValue: string | null) =>
  radioValue
    ? radioValue === optionId
      ? "form-check-checked"
      : "form-check-unchecked"
    : "";

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

  const [radioValue, setRadioValue] = useState(getRadioValue(value));

  //   useEffect(() => {
  //     setRadioValue(getRadioValue(value));
  //   }, [value]);

  //   const radioValue = getRadioValue(value);
  const [localValue, setLocalValue] = useState(getLocalValue(value));

  const updateCurrentValuesDebounced = debounce(updateCurrentValues, 500);

  const getValue = (event) => {
    const rawValue = event.target.value;
    const value = rawValue === "" ? null : Number(rawValue);
    return value;
  };

  const handleChange = (event) => {
    setLocalValue(event.target.value);
    updateCurrentValues({ [path]: getValue(event) });
  };

  const handleChangeDebounced = (event) => {
    setLocalValue(event.target.value);
    setRadioValue(moreThanOneYear);
    updateCurrentValuesDebounced({ [path]: getValue(event) });
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
    <FormItem {...props}>
      <Form.Check type="radio">
        <Form.Check.Label htmlFor={`${path}.0`}>
          <LessThanOneYearRadio
            {...radioProps}
            isChecked={radioValue === lessThanOneYear}
          />
          <Label labelId="years.less_than_one_year" />
        </Form.Check.Label>
      </Form.Check>
      <Form.Check type="radio" className="form-input-years">
        <Form.Check.Label htmlFor={`${path}.1`}>
          <MoreThanOneYearRadio
            {...radioProps}
            isChecked={radioValue === moreThanOneYear}
          />

          <FormControl
            type="number"
            value={localValue}
            onChange={handleChangeDebounced}
            onBlur={handleChange}
            disabled={readOnly}
          />

          <Label labelId="years.years" />
        </Form.Check.Label>
      </Form.Check>
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
    <Form.Check.Input
      type="radio"
      value={lessThanOneYear}
      name={path}
      id={`${path}.0`}
      // ref={refFunction}
      checked={isChecked}
      className={getcheckClass(lessThanOneYear, radioValue)}
      onClick={(e) => {
        if (isChecked) {
          // if this is checked, uncheck it and set question value to null
          setRadioValue(null);
          updateCurrentValues({ [path]: null });
        }
      }}
      onChange={(e) => {
        setRadioValue(lessThanOneYear);
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
    <Form.Check.Input
      type="radio"
      value={moreThanOneYear}
      name={path}
      id={`${path}.1`}
      // ref={refFunction}
      checked={isChecked}
      className={getcheckClass(moreThanOneYear, radioValue)}
      onClick={(e) => {
        if (isChecked) {
          // if this is checked, uncheck it and set question value to null
          setRadioValue(null);
          setLocalValue("");
          updateCurrentValues({ [path]: null });
        }
      }}
      onChange={(e) => {
        setRadioValue(moreThanOneYear);
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
        <FormattedMessage id={labelId} />
      </span>
    </div>
  </div>
);

export default FormComponentYears;
