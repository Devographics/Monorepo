"use client";
import React /*, { useState }*/ from "react";
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

  // TODO: why form update is not immediate as to get a controlled value?
  // TODO: even with a non immediate value, we should not need that,
  // just use the HTML input internal state + defaultValue and let it be uncontrolled
  // @see https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes
  // const [localValues, setLocalValues] = useState<Array<string>>(values);

  // TODO: assess if debouncing is really needed here, onchange is fired only on focus loss
  // (contrary to "oninput" which actually needs debouncing)
  const updateCurrentValuesDebounced = debounce(updateCurrentValues, 500);

  /*
  const handleChange = (event) => {
    //setLocalValue(event.target.value);
    updateCurrentValues({ [path]: event.target.value });
  };
  */

  const addItem = (value: string) => {
    updateCurrentValuesDebounced({
      [path]: [...values, value],
    });
  };
  const removeItem = (idx: number) => {
    updateCurrentValuesDebounced({
      // TODO: quick and dirty check if ok
      [path]: [...values.slice(0, idx), ...values.slice(idx + 1)],
    });
  };
  const updateItem = (idx: number, value: string) => {
    updateCurrentValuesDebounced({
      [path]: [...values.slice(0, idx), value, ...values.slice(idx + 1)],
    });
  };
  const handleChangeDebounced = (
    idx: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    if (!value) {
      removeItem(idx);
    } else if (idx >= values.length) {
      addItem(value);
    } else {
      updateItem(idx, value);
    }
    //setLocalValue(event.target.value);
    updateCurrentValuesDebounced({ [path]: event.target.value });
  };

  return (
    <FormItem {...props}>
      {[
        ...values,
        /** Always keep an additional empty element here */
        "",
      ].map((value, idx) => {
        return (
          <FormControl
            // TODO: this may mess up rendering, in Vulcan we had specific logic to handle a "visible index"
            // need to check what happens when removing an intermediate input, it may mess up the values
            key={idx}
            type="text"
            defaultValue={value}
            //value={localValue}
            onChange={(evt) => handleChangeDebounced(idx, evt)}
            // @ts-ignore TODO: TS is not happy with either ChangeEvent or FocusEvent
            onBlur={handleChangeDebounced}
            disabled={readOnly}
          />
        );
      })}
      <FormControl
        // TODO: this may mess up rendering, in Vulcan we had specific logic to handle a "visible index"
        // need to check what happens when removing an intermediate input, it may mess up the values
        key={values.length}
        type="text"
        defaultValue={""}
        //value={localValue}
        onChange={(evt) => handleChangeDebounced(values.length, evt)}
        // @ts-ignore TODO: TS is not happy with either ChangeEvent or FocusEvent
        onBlur={handleChangeDebounced}
        disabled={readOnly}
      />
    </FormItem>
  );
};
