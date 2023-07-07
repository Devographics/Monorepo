"use client";
import Form from "react-bootstrap/Form";
import { FormInputProps } from "~/components/form/typings";
import { FormOption } from "~/components/form/FormOption";
import { FormItem } from "~/components/form/FormItem";
import OtherOption from "./OtherOption";
import { getFormPaths } from "@devographics/templates";
import { useState } from "react";

export const FormComponentRadioGroup = (props: FormInputProps) => {
  const { value, question } = props;
  const { options, allowOther } = question;

  // keep track of whether "other" field is shown or not
  const [showOther, setShowOther] = useState<boolean>(!!value);

  const hasValue = value !== "";
  return (
    <FormItem {...props}>
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
