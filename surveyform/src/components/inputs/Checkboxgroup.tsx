"use client";
import { useState } from "react";
import Form from "react-bootstrap/Form";
import without from "lodash/without.js";
import { useIntlContext } from "@devographics/react-i18n";
import { Button } from "~/components/ui/Button";
import { FormItem } from "~/components/form/FormItem";
import { FormInputProps } from "~/components/form/typings";
import { FormOption } from "~/components/form/FormOption";
import { seededShuffle } from "~/lib/utils";
import { OPTION_NA } from "@devographics/types";
import OtherOption from "./OtherOption";

const defaultCutoff = 10;
// how many items to allow past the cutoff limit before actually cutting off the list
const cutoffMargin = 2;

// note: treat checkbox group the same as a nested component, using `path`
export const FormComponentCheckboxGroup = (props: FormInputProps) => {
  const { value: value_ = [], question, response } = props;
  const value = value_ as Array<string | number>;
  const intl = useIntlContext();

  const [showMore, setShowMore] = useState(false);
  // keep track of whether "other" field is shown or not
  const [showOther, setShowOther] = useState(!!value);

  const { options: options_, allowOther, limit, randomize } = question;

  if (!options_) {
    throw new Error(
      `Question ${question.id} does not have any options defined.`
    );
  }

  let options = options_;

  // remove "n/a" option and handle it separately
  const naOption = options.find((option) => option.id === OPTION_NA);
  options = options.filter((option) => option.id !== OPTION_NA);

  options = randomize
    ? seededShuffle(options, response?._id || "outline")
    : options;

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
        {naOption && (
          <Checkbox
            index={999}
            option={naOption}
            hasValue={hasValue}
            value={value}
            hasReachedLimit={hasReachedLimit}
            formProps={props}
          />
        )}
        {optionsToShow?.map((option, i) => {
          return (
            <Checkbox
              key={i}
              index={i}
              option={option}
              hasValue={hasValue}
              value={value}
              hasReachedLimit={hasReachedLimit}
              formProps={props}
            />
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
          <OtherOption
            {...props}
            mainValue={value}
            type="checkbox"
            showOther={showOther}
            setShowOther={setShowOther}
          />
        )}
      </div>
    </FormItem>
  );
};

const Checkbox = ({
  index,
  value,
  option,
  hasValue,
  hasReachedLimit,
  formProps,
}) => {
  const { path, updateCurrentValues, readOnly } = formProps;

  const isChecked = value?.includes(option.id);
  const checkClass = hasValue
    ? isChecked
      ? "form-check-checked"
      : "form-check-unchecked"
    : "";

  const isNA = option.id === OPTION_NA;
  const naIsChecked = value.includes(OPTION_NA);
  const disabled =
    !!readOnly || (!isChecked && hasReachedLimit) || (!isNA && naIsChecked);

  const getNewValue = (isChecked) => {
    if (isNA) {
      // when checking the "n/a" option, clear everything else
      return isChecked ? [OPTION_NA] : [];
    } else {
      return isChecked ? [...value, option.id] : without(value, option.id);
    }
  };
  return (
    <Form.Check className={checkClass}>
      <Form.Check.Label htmlFor={`${path}.${index}`}>
        <div className="form-input-wrapper">
          <Form.Check.Input
            type="checkbox"
            checked={isChecked}
            disabled={disabled}
            id={`${path}.${index}`}
            // ref={refFunction}
            onChange={(event) => {
              const isChecked = event.target.checked;
              const newValue = getNewValue(isChecked);
              updateCurrentValues({ [path]: newValue });
            }}
          />
        </div>
        <FormOption {...formProps} option={option} />
      </Form.Check.Label>
    </Form.Check>
  );
};
export default FormComponentCheckboxGroup;
