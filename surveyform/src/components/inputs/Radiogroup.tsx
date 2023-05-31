"use client";
import { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import isEmpty from "lodash/isEmpty.js";
import { FormInputProps } from "~/components/form/typings";
import { FormOption } from "~/components/form/FormOption";
import { useIntlContext } from "@devographics/react-i18n";
import { FormItem } from "~/components/form/FormItem";
import FormControl from "react-bootstrap/FormControl";
import debounce from "lodash/debounce.js";
import { getFormPaths } from "~/lib/surveys/helpers";

const OtherComponent = (props: FormInputProps) => {
  const { edition, question, updateCurrentValues, response, readOnly } = props;
  const formPaths = getFormPaths({ edition, question });
  const path = formPaths.other!;
  const value = response[path];

  const [showOther, setShowOther] = useState(!!value);

  // keep track of "other" field value locally
  const [localValue, setLocalValue] = useState(value);

  const updateCurrentValuesDebounced = debounce(updateCurrentValues, 500);

  const handleChange = (event) => {
    setLocalValue(event.target.value);
    updateCurrentValues({ [path]: event.target.value });
  };

  const handleChangeDebounced = (event) => {
    const value = event.target.value;
    setLocalValue(value);
    updateCurrentValuesDebounced({ [path]: value });
  };

  // whenever value changes (and is not empty), if it's not an "other" value
  // this means another option has been selected and we need to uncheck the "other" radio button
  useEffect(() => {
    if (value) {
      // TODO
      // setShowOther(isOtherValue(value));
      setShowOther(false);
    }
  }, [value]);

  return (
    <div className="form-option-other">
      <Form.Check
        name={path}
        label={"Other"}
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
        <FormControl
          type="text"
          value={localValue}
          onChange={handleChangeDebounced}
          onBlur={handleChange}
          disabled={readOnly}
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
        const isChecked = String(value) === String(option.id);
        const checkClass = hasValue
          ? isChecked
            ? "form-check-checked"
            : "form-check-unchecked"
          : "";

        return (
          <Form.Check key={i} type="radio">
            <Form.Check.Label htmlFor={`${path}.${i}`}>
              <div className="form-input-wrapper">
                <Form.Check.Input
                  type="radio"
                  value={option.id}
                  name={path}
                  id={`${path}.${i}`}
                  // ref={refFunction}
                  checked={isChecked}
                  className={checkClass}
                  onChange={(e) => {
                    const v = e.target.value;
                    const newValue = question.optionsAreNumeric ? Number(v) : v;
                    updateCurrentValues({ [path]: newValue });
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
