"use client";
import React, { useState } from "react";
import { Form } from "react-bootstrap";
import without from "lodash/without.js";
import uniq from "lodash/uniq.js";
import take from "lodash/take.js";
import isEmpty from "lodash/isEmpty.js";
import { FormInputProps, useFormContext } from "@devographics/react-form";
import FormOptionLabel from "~/form/components/elements/FormOptionLabel";
import FormOptionDescription from "~/form/components/elements/FormOptionDescription";
import { useIntlContext } from "@devographics/react-i18n";
import { Button } from "~/core/components/ui/Button";
import { FormItem } from "~/form/components/elements/FormItem";
import { FormComponentText } from "./Default";

// this marker is used to identify "other" values
export const otherMarker = "[other]";

// check if a string is an "other" value
export const isOtherValue = (s) =>
  s && typeof s === "string" && s.substr(0, otherMarker.length) === otherMarker;

// remove the "other" marker from a string
export const removeOtherMarker = (s) =>
  s && typeof s === "string" && s.substr(otherMarker.length);

// add the "other" marker to a string
export const addOtherMarker = (s) => `${otherMarker}${s}`;

// return array of values without the "other" value
export const removeOtherValue = (a) => {
  return a.filter((s) => !isOtherValue(s));
};

const OtherComponent = ({ value, path }) => {
  const { updateCurrentValues } = useFormContext();

  const otherValue = removeOtherMarker(value.find(isOtherValue));
  // get copy of checkbox group values with "other" value removed
  const withoutOtherValue = removeOtherValue(value);

  // keep track of whether "other" field is shown or not
  const [showOther, setShowOther] = useState(!!otherValue);

  // keep track of "other" field value locally
  const [textFieldValue, setTextFieldValue] = useState(otherValue);

  // textfield properties
  const textFieldInputProperties = {
    name,
    value: textFieldValue,
    onChange: (event) => {
      const fieldValue = event.target.value;
      // first, update local state
      setTextFieldValue(fieldValue);
      // then update global form state
      const newValue = isEmpty(fieldValue)
        ? withoutOtherValue
        : [...withoutOtherValue, addOtherMarker(fieldValue)];
      updateCurrentValues({ [path]: newValue });
    },
  };
  const textFieldItemProperties = { layout: "elementOnly" };

  return (
    <div className="form-option-other">
      <Form.Check
        layout="elementOnly"
        label={"Other"}
        // @ts-expect-error
        value={showOther}
        checked={showOther}
        onClick={(event) => {
          // @ts-expect-error
          const isChecked = event.target.checked;
          setShowOther(isChecked);
          if (isChecked) {
            // if checkbox is checked and textfield has value, update global form state with current textfield value
            if (textFieldValue) {
              updateCurrentValues({
                [path]: [...withoutOtherValue, addOtherMarker(textFieldValue)],
              });
            }
          } else {
            // if checkbox is unchecked, also clear out field value from global form state
            updateCurrentValues({ [path]: withoutOtherValue });
          }
        }}
      />
      {showOther && (
        <FormComponentText
          inputProperties={textFieldInputProperties}
          itemProperties={textFieldItemProperties}
        />
      )}
    </div>
  );
};

const defaultCutoff = 10;

// note: treat checkbox group the same as a nested component, using `path`
export const FormComponentCheckboxGroup = ({
  refFunction,
  label,
  path,
  value,
  formType,
  disabled,
  inputProperties,
  itemProperties = {},
}: FormInputProps) => {
  const intl = useIntlContext();
  const [showMore, setShowMore] = useState(false);
  const { updateCurrentValues } = useFormContext();

  const {
    // @ts-expect-error
    options = [],
    name,
    onChange,
    as,
    ...otherInputProperties
  } = inputProperties;

  const { cutoff = defaultCutoff } = itemProperties;

  // get rid of duplicate values; or any values that are not included in the options provided
  // (unless they have the "other" marker)
  value = value
    ? uniq(
        value.filter(
          (v) => isOtherValue(v) || options.map((o) => o.value).includes(v)
        )
      )
    : [];

  const hasValue = value.length > 0;

  const { limit } = itemProperties;
  const hasReachedLimit = limit && value.length >= limit;

  // if this is a "new document" form check options' "checked" property to populate value
  if (formType === "new" && value.length === 0) {
    const checkedValues = options
      .filter((o) => o.checked === true)
      .map((option) => option.value);
    if (checkedValues.length) {
      value = checkedValues;
    }
  }

  const useCutoff =
    typeof cutoff !== "undefined" && cutoff > 0 && options.length > cutoff;
  const optionsToShow = useCutoff
    ? showMore
      ? options
      : take(options, cutoff)
    : options;

  return (
    <FormItem path={path} label={label} {...itemProperties}>
      <div className="form-item-options">
        {optionsToShow.map((option, i) => {
          const isChecked = value.includes(option.value);
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
              name={name}
              // @ts-ignore
              // TODO
              layout="elementOnly"
              key={i}
              className={checkClass}
            >
              <Form.Check.Label htmlFor={`${path}.${i}`}>
                <div className="form-input-wrapper">
                  <Form.Check.Input
                    {...otherInputProperties}
                    type="checkbox"
                    value={isChecked}
                    checked={isChecked}
                    disabled={!isChecked && hasReachedLimit}
                    id={`${path}.${i}`}
                    // @ts-ignore
                    // TODO
                    path={`${path}.${i}`}
                    ref={refFunction}
                    onChange={(event) => {
                      const isChecked = event.target.checked;
                      const newValue = isChecked
                        ? [...value, option.value]
                        : without(value, option.value);
                      updateCurrentValues({ [path]: newValue });
                    }}
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
        {useCutoff && !showMore && (
          <Button
            className="form-show-more"
            onClick={() => {
              setShowMore(true);
            }}
          >
            {intl.formatMessage({ id: "forms.more_options" })}…
          </Button>
        )}
        {itemProperties.showOther && (
          <OtherComponent value={value} path={path} />
        )}
      </div>
    </FormItem>
  );
};

export default FormComponentCheckboxGroup;
