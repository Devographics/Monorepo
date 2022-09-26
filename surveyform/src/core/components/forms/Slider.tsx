import React, { useState, useEffect } from "react";
import { FormCheck } from "react-bootstrap";
import isEmpty from "lodash/isEmpty.js";
import {
  FormInputProps,
  useFormContext,
  useVulcanComponents,
} from "@vulcanjs/react-ui";

export const Slider = ({
  refFunction,
  path,
  inputProperties,
  itemProperties = {},
  intlKeys,
}: FormInputProps) => {
  const Components = useVulcanComponents();
  const { updateCurrentValues } = useFormContext();
  // @ts-expect-error
  const { options = [], value, ...otherInputProperties } = inputProperties;
  const hasValue = value !== "";
  return (
    <Components.FormItem
      path={/*inputProperties.*/ path}
      label={inputProperties.label}
      {...itemProperties}
    >
      <div className="form-slider">
        <div className="form-slider-options">
          {options.map((option, i) => {
            const hasLabel = option.label && Number(option.label) !== option.value;
            const isChecked = value === option.value;
            const checkClass = hasValue
              ? isChecked
                ? "form-check-checked"
                : "form-check-unchecked"
              : "";
            return (
              <label key={i} className="form-check-wrapper" htmlFor={`${path}.${i}`}>
              {/*
              // @ts-expect-error */}
              <FormCheck
                {...otherInputProperties}
                layout="elementOnly"
                type="radio"
                // @ts-ignore
                label={hasLabel && <Components.FormOptionLabel option={option} />}
                value={option.value}
                name={path}
                id={`${path}.${i}`}
                path={`${path}.${i}`}
                ref={refFunction}
                checked={isChecked}
                className={checkClass}
              />
              </label>
            );
          })}
        </div>
      </div>
    </Components.FormItem>
  );
};

export default Slider;
