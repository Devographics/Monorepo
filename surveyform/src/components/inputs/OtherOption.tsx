"use client";
import { Dispatch, useState, SetStateAction } from "react";
import Form from "react-bootstrap/Form";
import { FormInputProps } from "~/components/form/typings";
import { FormOption } from "~/components/form/FormOption";
import debounce from "lodash/debounce.js";
import FormControl from "react-bootstrap/FormControl";
import { OPTION_NA } from "@devographics/types";
import { getFormPaths } from "@devographics/templates";
import { useIntlContext } from "@devographics/react-i18n";

const OtherOption = (
  props: FormInputProps & {
    showOther: boolean;
    setShowOther: Dispatch<SetStateAction<boolean>>;
    type: "radio" | "checkbox";
    mainValue: string | number | Array<string | number>;
  }
) => {
  const {
    edition,
    question,
    updateCurrentValues,
    response,
    readOnly,
    mainValue,
    type = "checkbox",
    showOther,
    setShowOther,
  } = props;
  const formPaths = getFormPaths({ edition, question });
  const path = formPaths.other!;
  const otherValue = response?.[path];

  const { formatMessage } = useIntlContext();

  // keep track of "other" field value locally
  const [localValue, setLocalValue] = useState(otherValue);

  const updateCurrentValuesDebounced = debounce(updateCurrentValues, 500);

  const handleChange = (event) => {
    const value = event.target.value === "" ? null : event.target.value;
    setLocalValue(value);
    updateCurrentValues({ [path]: value });
  };

  const handleChangeDebounced = (event) => {
    const value = event.target.value === "" ? null : event.target.value;
    setLocalValue(value);
    updateCurrentValuesDebounced({ [path]: value });
  };

  const checkClass = showOther ? "form-check-checked" : "form-check-unchecked";

  const naIsChecked = Array.isArray(mainValue) && mainValue.includes(OPTION_NA);
  const disabled = readOnly || naIsChecked;

  return (
    <div className="form-option-other">
      <Form.Check className={checkClass}>
        <Form.Check.Label htmlFor={`${path}.other`}>
          <div className="form-input-wrapper">
            <Form.Check.Input
              id={`${path}.other`}
              name={path}
              type={type}
              checked={showOther}
              disabled={disabled}
              onChange={(event) => {
                const isChecked = event.target.checked;
                setShowOther(isChecked);
                if (type === "radio") {
                  // if this is a radio button, uncheck all other options
                  updateCurrentValues({ [formPaths.response!]: null });
                }
              }}
            />
          </div>
          <FormOption
            {...props}
            isChecked={showOther}
            option={{ id: "other", intlId: "options.other" }}
          />
        </Form.Check.Label>
      </Form.Check>
      {showOther && (
        <FormControl
          type="text"
          value={localValue || ""}
          onChange={handleChangeDebounced}
          onBlur={handleChange}
          disabled={disabled}
          placeholder={formatMessage({ id: "options.other.placeholder" })}
        />
      )}
    </div>
  );
};

export default OtherOption;
