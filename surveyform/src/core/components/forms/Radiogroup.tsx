import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import isEmpty from "lodash/isEmpty.js";
import {
  isOtherValue,
  removeOtherMarker,
  addOtherMarker,
} from "./Checkboxgroup";
import {
  FormInputProps,
  useFormContext,
  useVulcanComponents,
} from "@vulcanjs/react-ui";
import FormOptionLabel from "~/core/components/survey/questions/FormOptionLabel";
import FormOptionDescription from "~/core/components/survey/questions/FormOptionDescription";
import { useIntlContext } from "@vulcanjs/react-i18n";

const OtherComponent = ({
  value,
  path,
}: Pick<FormInputProps, "path" | "value">) => {
  const { updateCurrentValues } = useFormContext();
  const Components = useVulcanComponents();
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
        <Components.FormComponentText
          inputProperties={textFieldInputProperties}
          itemProperties={textFieldItemProperties}
        />
      )}
    </div>
  );
};

export const FormComponentRadioGroup = ({
  refFunction,
  path,
  inputProperties,
  itemProperties = {},
}: FormInputProps) => {
  const intl = useIntlContext();

  const Components = useVulcanComponents();
  const { updateCurrentValues } = useFormContext();
  const {
    // @ts-expect-error
    options = [],
    value,
    onChange,
    as,
    ...otherInputProperties
  } = inputProperties;
  const hasValue = value !== "";
  return (
    <Components.FormItem
      path={/*inputProperties.*/ path}
      label={inputProperties.label}
      {...itemProperties}
    >
      {options.map((option, i) => {
        const isChecked = value === option.value;
        const checkClass = hasValue
          ? isChecked
            ? "form-check-checked"
            : "form-check-unchecked"
          : "";

        const optionDescription = intl.formatMessage({
          id: `${option.intlId}.description`,
        });

        return (
          <Form.Check
            {...otherInputProperties}
            key={i}
            // @ts-ignore
            // TODO
            layout="elementOnly"
            type="radio"
          >
            <Form.Check.Label htmlFor={`${path}.${i}`}>
              <div className="form-input-wrapper">
                <Form.Check.Input
                  {...otherInputProperties}
                  type="radio"
                  value={option.value}
                  name={path}
                  id={`${path}.${i}`}
                  // @ts-ignore
                  // TODO
                  path={`${path}.${i}`}
                  ref={refFunction}
                  checked={isChecked}
                  className={checkClass}
                  onChange={onChange}
                />
              </div>
              <div className="form-option">
                <FormOptionLabel option={option} />
                {optionDescription && (
                  <FormOptionDescription
                    optionDescription={optionDescription}
                  />
                )}
              </div>
            </Form.Check.Label>
          </Form.Check>
        );
      })}
      {itemProperties.showOther && <OtherComponent value={value} path={path} />}
    </Components.FormItem>
  );
};

export default FormComponentRadioGroup;
