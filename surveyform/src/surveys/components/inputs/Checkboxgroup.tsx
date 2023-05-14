"use client";
import { useState } from "react";
import Form from "react-bootstrap/Form";
import without from "lodash/without.js";
import uniq from "lodash/uniq.js";
import take from "lodash/take.js";
import isEmpty from "lodash/isEmpty.js";
import { useIntlContext } from "@devographics/react-i18n";
import { Button } from "~/core/components/ui/Button";
import { FormItem } from "~/surveys/components/form/FormItem";
import { FormComponentText } from "./Default";
import { useFormContext } from "~/surveys/components/form/FormContext";
import { FormInputProps } from "~/surveys/components/form/typings";
import { FormOption } from "~/surveys/components/form/FormOption";

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

const OtherComponent = ({
  value,
  path,
  updateCurrentValues,
}: FormInputProps) => {
  const otherValue = removeOtherMarker(value?.find(isOtherValue));
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
export const FormComponentCheckboxGroup = (props: FormInputProps) => {
  const intl = useIntlContext();
  const [showMore, setShowMore] = useState(false);

  const {
    path,
    value: value_ = [],
    question,
    updateCurrentValues,
    readOnly,
  } = props;
  const { options, allowOther, limit } = question;

  const value = value_ as string[] | number[];

  const cutoff = defaultCutoff;

  const hasValue = value?.length > 0;

  const hasReachedLimit = limit && value?.length >= limit;

  const useCutoff =
    typeof cutoff !== "undefined" && cutoff > 0 && options?.length > cutoff;
  const optionsToShow = useCutoff
    ? showMore
      ? options
      : options?.slice(0, cutoff)
    : options;

  return (
    <FormItem {...props}>
      <div className="form-item-options">
        {optionsToShow?.map((option, i) => {
          const isChecked = value?.includes(option.id);
          const checkClass = hasValue
            ? isChecked
              ? "form-check-checked"
              : "form-check-unchecked"
            : "";

          return (
            <Form.Check layout="elementOnly" key={i} className={checkClass}>
              <Form.Check.Label htmlFor={`${path}.${i}`}>
                <div className="form-input-wrapper">
                  <Form.Check.Input
                    type="checkbox"
                    value={isChecked}
                    checked={isChecked}
                    disabled={!isChecked && hasReachedLimit}
                    id={`${path}.${i}`}
                    path={`${path}.${i}`}
                    // ref={refFunction}
                    onChange={(event) => {
                      const isChecked = event.target.checked;
                      console.log(isChecked);
                      const newValue = isChecked
                        ? [...value, option.id]
                        : without(value, option.id);
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
        {allowOther && <OtherComponent {...props} />}
      </div>
    </FormItem>
  );
};

export default FormComponentCheckboxGroup;
