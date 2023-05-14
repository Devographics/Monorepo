"use client";
import FormCheck from "react-bootstrap/FormCheck";
import type { FormInputProps } from "@devographics/react-form";
import { FormItem } from "~/surveys/components/form/FormItem";
import FormOptionLabel from "~/form/components/elements/FormOptionLabel";

export const Slider = ({
  refFunction,
  path,
  inputProperties,
  itemProperties = {},
  intlKeys,
}: FormInputProps) => {
  // @ts-expect-error
  const { options = [], value, ...otherInputProperties } = inputProperties;
  const hasValue = value !== "";
  return (
    <FormItem
      path={/*inputProperties.*/ path}
      label={inputProperties.label}
      {...itemProperties}
    >
      <div className="form-slider">
        <div className="form-slider-options">
          {options.map((option, i) => {
            const hasLabel =
              option.label && Number(option.label) !== option.value;
            const isChecked = value === option.value;
            const checkClass = hasValue
              ? isChecked
                ? "form-check-checked"
                : "form-check-unchecked"
              : "";
            return (
              <label
                key={i}
                className="form-check-wrapper"
                htmlFor={`${path}.${i}`}
              >
                {/*
              // @ts-expect-error */}
                <FormCheck
                  {...otherInputProperties}
                  layout="elementOnly"
                  type="radio"
                  // @ts-ignore
                  label={hasLabel && <FormOptionLabel option={option} />}
                  value={option.value}
                  name={path}
                  id={`${path}.${i}`}
                  path={`${path}.${i}`}
                  ref={refFunction}
                  checked={isChecked}
                  className={checkClass}
                  disabled={readOnly}
                />
              </label>
            );
          })}
        </div>
      </div>
    </FormItem>
  );
};

export default Slider;
