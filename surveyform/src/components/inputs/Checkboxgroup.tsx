"use client";
import { useState } from "react";
import Form from "react-bootstrap/Form";
import without from "lodash/without.js";
import { useIntlContext } from "@devographics/react-i18n";
import { Button } from "~/components/ui/Button";
import { FormItem } from "~/components/form/FormItem";
import { FormInputProps } from "~/components/form/typings";
import { FormOption } from "~/components/form/FormOption";
import debounce from "lodash/debounce.js";
import FormControl from "react-bootstrap/FormControl";
import { getFormPaths } from "~/lib/surveys/helpers";
import { seededShuffle } from "~/lib/utils";

const OtherComponent = (props: FormInputProps) => {
  const { edition, question, updateCurrentValues, response, readOnly } = props;
  const formPaths = getFormPaths({ edition, question });
  const path = formPaths.other!;
  const value = response[path];

  // keep track of whether "other" field is shown or not
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

  const checkClass = showOther ? "form-check-checked" : "form-check-unchecked";

  return (
    <div className="form-option-other">
      <Form.Check className={checkClass}>
        <Form.Check.Label htmlFor={`${path}.other`}>
          <div className="form-input-wrapper">
            <Form.Check.Input
              id={`${path}.other`}
              type="checkbox"
              checked={showOther}
              onChange={(event) => {
                const isChecked = event.target.checked;
                setShowOther(isChecked);
              }}
            />
          </div>
          <FormOption
            {...props}
            option={{ id: "other", intlId: "options.other" }}
          />
        </Form.Check.Label>
      </Form.Check>
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

const defaultCutoff = 10;
// how many items to allow past the cutoff limit before actually cutting off the list
const cutoffMargin = 2;

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
    response,
  } = props;

  const { options: options_, allowOther, limit, randomize } = question;

  if (!options_) {
    throw new Error(
      `Question ${question.id} does not have any options defined.`
    );
  }

  const options = randomize ? seededShuffle(options_, response._id) : options_;

  const value = value_ as Array<string | number>;

  const cutoff = question.cutoff || defaultCutoff;

  const hasValue = value?.length > 0;

  const hasReachedLimit = !!(limit && value?.length >= limit);

  const enableCutoff =
    typeof cutoff !== "undefined" &&
    cutoff > 0 &&
    options?.length > cutoff + cutoffMargin;

  const optionsToShow = enableCutoff
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
            <Form.Check key={i} className={checkClass}>
              <Form.Check.Label htmlFor={`${path}.${i}`}>
                <div className="form-input-wrapper">
                  <Form.Check.Input
                    type="checkbox"
                    checked={isChecked}
                    disabled={!!readOnly || (!isChecked && hasReachedLimit)}
                    id={`${path}.${i}`}
                    // ref={refFunction}
                    onChange={(event) => {
                      const isChecked = event.target.checked;
                      const newValue = isChecked
                        ? [...value, option.id]
                        : without(value, option.id);
                      updateCurrentValues({ [path]: newValue });
                    }}
                  />
                </div>
                <FormOption {...props} option={option} />
              </Form.Check.Label>
            </Form.Check>
          );
        })}
        {enableCutoff && !showMore && (
          <Button
            className="form-show-more"
            onClick={() => {
              setShowMore(true);
            }}
          >
            {intl.formatMessage({ id: "forms.more_options" })}
          </Button>
        )}
        {allowOther && (!enableCutoff || showMore) && (
          <OtherComponent {...props} />
        )}
      </div>
    </FormItem>
  );
};

export default FormComponentCheckboxGroup;
