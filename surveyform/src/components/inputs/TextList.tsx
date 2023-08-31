"use client";
import React, { useState /*, { useState }*/ } from "react";
import FormControl from "react-bootstrap/FormControl";
import { FormInputProps } from "~/components/form/typings";
import { FormItem } from "~/components/form/FormItem";
import debounce from "lodash/debounce.js";

/**
 * Create additional items as user add values
 * TODO: check mockup https://github.com/LeaVerou/stateof/tree/main/mocks/custom-options
 * TODO: see arrays from Vulcan: https://github.com/VulcanJS/vulcan-npm/tree/main/packages/react-ui-lite/components/form/nested
 *
 * Components are defined here: surveyform/src/lib/customComponents.ts
 * @param props
 * @returns
 */
export const TextList = (props: FormInputProps<Array<string>>) => {
  const {
    path,
    value: value_,
    question,
    updateCurrentValues,
    readOnly,
  } = props;

  const values = value_ || [];

  // TODO: check that the key is correctly set based on "value"
  // @see https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes
  const [localValues, setLocalValues] = useState<Array<string>>(values);

  // TODO: assess if debouncing is really needed here, onchange is fired only on focus loss
  // (contrary to "oninput" which actually needs debouncing)
  const updateCurrentValuesDebounced = debounce(updateCurrentValues, 500);

  const handleChange = (values) => {
    setLocalValues(values);
    updateCurrentValuesDebounced({ [path]: values });
  };

  const addItem = (value: string) => {
    handleChange([...localValues, value]);
  };
  const removeItem = (idx: number) => {
    handleChange([...localValues.slice(0, idx), ...localValues.slice(idx + 1)]);
    // TODO: should we remove the value if the array becomes totally empty?
    // by setting it to "null"?
  };
  const updateItem = (idx: number, value: string) => {
    handleChange([
      ...localValues.slice(0, idx),
      value,
      ...localValues.slice(idx + 1),
    ]);
  };
  const handleChangeDebounced = (
    idx: number,
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.FocusEvent<HTMLInputElement | HTMLTextAreaElement> // onBlur
  ) => {
    const value = event.target.value;
    if (!value) {
      removeItem(idx);
    } else if (idx >= localValues.length) {
      addItem(value);
    } else {
      updateItem(idx, value);
    }
    //setLocalValue(event.target.value);
    updateCurrentValuesDebounced({ [path]: event.target.value });
  };

  const valuesWithAdditionalInput = localValues.length
    ? [...localValues, ""]
    : [""];
  return (
    <FormItem {...props}>
      {valuesWithAdditionalInput.map((value, idx) => {
        return (
          <FormControl
            // TODO: this may mess up rendering, in Vulcan we had specific logic to handle a "visible index"
            // need to check what happens when removing an intermediate input, it may mess up the values
            key={idx}
            type="text"
            defaultValue={value}
            //value={localValue}
            onChange={(evt) => handleChangeDebounced(idx, evt)}
            onBlur={(evt) => handleChangeDebounced(idx, evt)}
            disabled={readOnly}
          />
        );
      })}
    </FormItem>
  );
};
