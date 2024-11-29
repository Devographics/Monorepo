"use client";
import { useState } from "react";
import without from "lodash/without.js";
import { useI18n } from "@devographics/react-i18n";
import { Button } from "~/components/ui/Button";
import { FormItem } from "~/components/form/FormItem";
import { FormInputProps } from "~/components/form/typings";
import { FormOption } from "~/components/form/FormOption";
import { alphaSort, randomSort } from "~/lib/utils";
import { OPTION_NA, OptionMetadata, OptionsOrder } from "@devographics/types";
import OtherOption from "./OtherOption";
import { getFormPaths } from "@devographics/templates";

import { useFormStateContext } from "../form/FormStateContext";

const defaultCutoff = 99;
// how many items to allow past the cutoff limit before actually cutting off the list
const cutoffMargin = 2;

/**
 * Multiple checkbox
 * + optionnaly an "others" field
 *
 * NOTE: treat checkbox group the same as a nested component, using `path`
 * @param props
 * @returns
 */
export const FormComponentCheckboxGroup = (
  props: FormInputProps<string[] | number[]>
) => {
  const { value, edition, question } = props;
  const { response } = useFormStateContext();
  const hasValue = value?.length > 0;
  const { t } = useI18n();
  const formPaths = getFormPaths({ edition, question });
  const otherValue = response?.[formPaths.other!];

  const [showMore, setShowMore] = useState(false);
  // keep track of whether "other" field is shown or not
  const [showOther, setShowOther] = useState(!!otherValue);

  const { options: options_, allowOther, limit, order } = question;

  if (!options_) {
    throw new Error(
      `Question ${question.id} does not have any options defined.`
    );
  }

  let options = options_;

  // remove "n/a" option and handle it separately
  const naOptionIndex = options.findIndex((option) => option.id === OPTION_NA);
  const naPosition = naOptionIndex === 0 ? "top" : "bottom";
  const naOption = options[naOptionIndex];
  options = options.filter((option) => option.id !== OPTION_NA);

  switch (order) {
    case OptionsOrder.SPECIFIED:
      // do nothing, use specified options order
      break;
    case OptionsOrder.RANDOM:
      options = randomSort(options, response?._id);
      break;
    case OptionsOrder.ALPHA:
      options = alphaSort(options);
      break;
    default:
      // default to doing nothing
      break;
  }

  const cutoff = question.cutoff || defaultCutoff;

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
    <FormItem {...props} showMore={showMore} showOther={showOther}>
      <div className="form-item-options">
        {naOption && naPosition === "top" && (
          <Checkbox
            {...props}
            index={999}
            option={naOption}
            hasValue={hasValue}
            hasReachedLimit={hasReachedLimit}
            value={value}
          />
        )}
        {optionsToShow?.map((option, i) => {
          return (
            <Checkbox
              {...props}
              key={i}
              index={i}
              option={option}
              hasValue={hasValue}
              hasReachedLimit={hasReachedLimit}
              value={value}
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
            {t("forms.more_options")}
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
        {naOption && naPosition === "bottom" && (
          <Checkbox
            {...props}
            index={999}
            option={naOption}
            hasValue={hasValue}
            hasReachedLimit={hasReachedLimit}
            value={value}
          />
        )}
      </div>
    </FormItem>
  );
};

const Checkbox = (
  props: FormInputProps<string[] | number[]> & {
    option: OptionMetadata;
    index: number;
    hasValue: boolean;
    hasReachedLimit: boolean;
    value: Array<string | number>;
  }
) => {
  const {
    index,
    value = [],
    option,
    hasValue,
    hasReachedLimit,
    path,
    updateCurrentValues,
    readOnly,
  } = props;

  const isChecked = value?.includes(option.id);
  const checkClass = hasValue
    ? isChecked
      ? "form-check-checked"
      : "form-check-unchecked"
    : "";

  const isNA = option.id === OPTION_NA;
  const naIsChecked = value?.includes(OPTION_NA);
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
    <div
      className={[checkClass, "form-check", `form-option-${option.id}`].join(
        " "
      )}
    >
      <label className="form-check-label" htmlFor={`${path}.${index}`}>
        <div className="form-input-wrapper">
          <input
            className="form-check-input"
            type="checkbox"
            checked={isChecked}
            disabled={disabled}
            id={`${path}.${index}`}
            name={path}
            value={option.id}
            onChange={(event) => {
              const isChecked = event.target.checked;
              const newValue = getNewValue(isChecked);
              updateCurrentValues({ [path]: newValue });
            }}
          />
        </div>
        <FormOption {...props} isChecked={isChecked} option={option} />
      </label>
    </div>
  );
};
export default FormComponentCheckboxGroup;
