"use client";
import { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";

import isEmpty from "lodash/isEmpty.js";
import {
  isOtherValue,
  removeOtherMarker,
  addOtherMarker,
} from "./Checkboxgroup";
import { FormInputProps } from "~/surveys/components/form/typings";
import { FormOption } from "~/surveys/components/form/FormOption";
import { useIntlContext } from "@devographics/react-i18n";
import { FormItem } from "~/surveys/components/form/FormItem";
import { FormComponentText } from "./Default";

const OtherComponent = ({
  value,
  path,
  updateCurrentValues,
}: FormInputProps) => {
  const otherValue = removeOtherMarker(value);

  // keep track of whether "other" field is shown or not
  const [showOther, setShowOther] = useState(isOtherValue(value));

  // keep track of "other" field value locally
  const [textFieldValue, setTextFieldValue] = useState(otherValue);

  // whenever value changes (and is not empty), if it's not an "other" value
  // this means another option has been selected and we need to uncheck the "other" radio button
  useEffect(() => {
    if (value) {
      setShowOther(isOtherValue(value));
    }
  }, [value]);

  // textfield properties
  const textFieldInputProperties = {
    name: path,
    value: textFieldValue,
    onChange: (event) => {
      const fieldValue = event.target.value;
      // first, update local state
      setTextFieldValue(fieldValue);
      // then update global form state
      const newValue = isEmpty(fieldValue) ? null : addOtherMarker(fieldValue);
      updateCurrentValues({ [path]: newValue });
    },
  };
  const textFieldItemProperties = { layout: "elementOnly" };

  return (
    <div className="form-option-other">
      <Form.Check
        name={path}
        // @ts-expect-error
        layout="elementOnly"
        label={"Other"}
        value={showOther}
        checked={showOther}
        type="radio"
        onClick={(event) => {
          // @ts-expect-error
          const isChecked = event.target.checked;
          // clear any previous values to uncheck all other checkboxes
          updateCurrentValues({ [path]: null });
          setShowOther(isChecked);
        }}
      />
      {showOther && (
        <FormComponentText
          // @ts-ignore
          inputProperties={textFieldInputProperties}
          itemProperties={textFieldItemProperties}
        />
      )}
    </div>
  );
};

export const FormComponentRadioGroup = (props: FormInputProps) => {
  const intl = useIntlContext();

  const { path, value, question, updateCurrentValues, readOnly } = props;
  const { options, allowOther } = question;

  const hasValue = value !== "";
  return (
    <FormItem {...props}>
      {options?.map((option, i) => {
        const isChecked = value === option.id;
        const checkClass = hasValue
          ? isChecked
            ? "form-check-checked"
            : "form-check-unchecked"
          : "";

        return (
          <Form.Check key={i} layout="elementOnly" type="radio">
            <Form.Check.Label htmlFor={`${path}.${i}`}>
              <div className="form-input-wrapper">
                <Form.Check.Input
                  type="radio"
                  value={option.id}
                  name={path}
                  id={`${path}.${i}`}
                  path={`${path}.${i}`}
                  // ref={refFunction}
                  checked={isChecked}
                  className={checkClass}
                  onChange={(e) => {
                    updateCurrentValues({ [path]: e.target.value });
                  }}
                  disabled={readOnly}
                />
              </div>
              <FormOption {...props} option={option} />
            </Form.Check.Label>
          </Form.Check>
        );
      })}
      {allowOther && <OtherComponent {...props} />}
    </FormItem>
  );
};

export default FormComponentRadioGroup;
