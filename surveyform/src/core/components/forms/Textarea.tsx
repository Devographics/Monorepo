import { FormInputProps, useVulcanComponents } from "@vulcanjs/react-ui";
import React, { useState } from "react";
import { FormControl } from "react-bootstrap";
import debounce from 'lodash/debounce.js';

export const FormComponentTextarea = ({
  path,
  label,
  refFunction,
  inputProperties = {},
  itemProperties = {},
}: FormInputProps) => {
  const { onChange, value } = inputProperties
  const [ localValue, setLocalValue ] = useState(value);

  const Components = useVulcanComponents();

  const onChangeDebounced = debounce(onChange, 500);

  const handleChange = (event)=> {
    setLocalValue(event.target.value);
    if (onChange) {
      onChange(event);
    }
  }

  const handleChangeDebounced = (event)=> {
    setLocalValue(event.target.value);
    onChangeDebounced(event);
  }

  return (
    <Components.FormItem path={path} label={label} {...itemProperties}>
      <FormControl
        // @ts-expect-error
        as="textarea"
        ref={refFunction}
        {...inputProperties}
        // @ts-expect-error
        value={localValue}
        onChange={handleChangeDebounced}
        onBlur={handleChange}
      />
    </Components.FormItem>
  );
};

export default FormComponentTextarea