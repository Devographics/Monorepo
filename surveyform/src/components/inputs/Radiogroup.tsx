"use client";
import Form from "react-bootstrap/Form";
import { FormInputProps } from "~/components/form/typings";
import { FormOption } from "~/components/form/FormOption";
import { FormItem } from "~/components/form/FormItem";
import OtherOption from "./OtherOption";
import { getFormPaths } from "@devographics/templates";
import { useState } from "react";
import isNil from "lodash/isNil";
import { OPTION_NA } from "@devographics/types";

export const FormComponentRadioGroup = (props: FormInputProps) => {
  const { value, edition, response, question } = props;
  const { options: options_, allowOther } = question;

  if (!options_) {
    throw new Error(
      `Question ${question.id} does not have any options defined.`
    );
  }

  let options = options_;

  // remove "n/a" option and handle it separately
  const naOptionIndex = options.findIndex((option) => option.id === OPTION_NA);
  const naPosition = naOptionIndex === 0 ? "top" : "bottom";
  const naOption = options[naOptionIndex];
  options = options.filter((option) => option.id !== OPTION_NA);

  const formPaths = getFormPaths({ edition, question });
  const otherPath = formPaths.other!;
  const otherValue = response?.[otherPath];
  const hasOtherValue = !isNil(otherValue);
  // keep track of whether "other" field is shown or not
  const [showOther, setShowOther] = useState<boolean>(hasOtherValue);

  const hasValue = value !== "";
  return (
    <FormItem {...props}>
      {" "}
      {naOption && naPosition === "top" && (
        <Radio
          index={999}
          option={naOption}
          hasValue={hasValue}
          value={value}
          formProps={props}
          setShowOther={setShowOther}
        />
      )}
      {options?.map((option, i) => {
        return (
          <Radio
            key={i}
            index={i}
            option={option}
            hasValue={hasValue}
            value={value}
            formProps={props}
            setShowOther={setShowOther}
          />
        );
      })}
      {allowOther && (
        <OtherOption
          {...props}
          mainValue={value}
          type="radio"
          showOther={showOther}
          setShowOther={setShowOther}
        />
      )}
      {naOption && naPosition === "bottom" && (
        <Radio
          index={999}
          option={naOption}
          hasValue={hasValue}
          value={value}
          formProps={props}
          setShowOther={setShowOther}
        />
      )}
    </FormItem>
  );
};

const Radio = ({ index, value, option, hasValue, formProps, setShowOther }) => {
  const { path, updateCurrentValues, edition, question, readOnly } = formProps;

  const formPaths = getFormPaths({ edition, question });

  const isChecked = String(value) === String(option.id);
  const checkClass = hasValue
    ? isChecked
      ? "form-check-checked"
      : "form-check-unchecked"
    : "";

  const disabled = readOnly;

  return (
    <Form.Check type="radio">
      <Form.Check.Label htmlFor={`${path}.${index}`}>
        <div className="form-input-wrapper">
          <Form.Check.Input
            type="radio"
            value={option.id}
            name={path}
            id={`${path}.${index}`}
            // ref={refFunction}
            checked={isChecked}
            className={checkClass}
            onClick={(e) => {
              const target = e.target as HTMLInputElement;
              const clickedValue = target.value;
              if (clickedValue === value) {
                updateCurrentValues({ [path]: null });
              }
            }}
            onChange={(e) => {
              const v = e.target.value;
              const newValue = question.optionsAreNumeric ? Number(v) : v;
              updateCurrentValues({ [path]: newValue });
              if (formPaths.other) {
                setShowOther(false);
              }
            }}
            disabled={disabled}
          />
        </div>
        <FormOption {...formProps} option={option} />
      </Form.Check.Label>
    </Form.Check>
  );
};
export default FormComponentRadioGroup;
