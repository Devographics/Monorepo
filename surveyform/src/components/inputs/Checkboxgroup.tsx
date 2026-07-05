"use client";
import { useState } from "react";
import without from "lodash/without.js";
import { T, useI18n } from "@devographics/react-i18n";
import { Button } from "~/components/ui/Button";
import { FormItem } from "~/components/form/FormItem";
import { FormInputProps } from "~/components/form/typings";
import { FormOption } from "~/components/form/FormOption";
import { alphaSort, randomSort } from "~/lib/utils";
import { OPTION_NA, OptionMetadata, OptionsOrder } from "@devographics/types";
import OtherOption from "./OtherOption";
import { getFormPaths } from "@devographics/templates";

import { useFormStateContext } from "../form/FormStateContext";
import uniq from "lodash/uniq.js";
import compact from "lodash/compact.js";

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
  props: FormInputProps<string[] | number[]>,
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
      `Question ${question.id} does not have any options defined.`,
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

  // cutoff
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

  // group options
  const hasGroupedOptions = !!options.find((o) => o.group);
  const ungroupedOptions = {
    id: "other",
    items: optionsToShow.filter((o) => !o.group),
  };
  let groupedOptions;
  if (hasGroupedOptions) {
    const optionGroups = compact(uniq(optionsToShow.map((o) => o.group)));
    groupedOptions = [
      ...optionGroups.map((group) => ({
        id: group,
        items: optionsToShow.filter((o) => o.group === group),
      })),
      ungroupedOptions,
    ];
  } else {
    groupedOptions = [ungroupedOptions];
  }

  const formProps = { ...props, options };

  return (
    <FormItem {...formProps} showMore={showMore} showOther={showOther}>
      <div className="form-item-options">
        {naOption && naPosition === "top" && (
          <Checkbox
            {...formProps}
            index={999}
            option={naOption}
            hasValue={hasValue}
            hasReachedLimit={hasReachedLimit}
            value={value}
          />
        )}

        {groupedOptions.map(({ id, items }, i) => (
          <OptionGroup
            {...formProps}
            hasGroupedOptions={hasGroupedOptions}
            index={i}
            key={i}
            id={id}
            items={items}
            hasValue={hasValue}
            hasReachedLimit={hasReachedLimit}
            value={value}
          />
        ))}

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
            {...formProps}
            mainValue={value}
            type="checkbox"
            showOther={showOther}
            setShowOther={setShowOther}
          />
        )}
        {naOption && naPosition === "bottom" && (
          <Checkbox
            {...formProps}
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

type CheckboxGroupProps = FormInputProps<string[] | number[]> & {
  id: string;
  items: OptionMetadata[];
  index: number;
  hasValue: boolean;
  hasReachedLimit: boolean;
  value: Array<string | number>;
  hasGroupedOptions: boolean;
};

const OptionGroup = (props: CheckboxGroupProps) => {
  const { id, items, question, hasGroupedOptions } = props;
  return (
    <div className="form-item-options-group">
      {hasGroupedOptions && (
        <h5 className="form-item-options-group-heading">
          <T token={`options.${question.id}.${id}`} />
        </h5>
      )}
      {items?.map((option, i) => {
        return <Checkbox {...props} key={i} index={i} option={option} />;
      })}
    </div>
  );
};

type CheckboxProps = FormInputProps<string[] | number[]> & {
  option: OptionMetadata;
  options: OptionMetadata[];
  index: number;
  hasValue: boolean;
  hasReachedLimit: boolean;
  value: Array<string | number>;
};
const Checkbox = (props: CheckboxProps) => {
  const {
    index,
    value = [],
    options,
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

  const optionIndex = options.findIndex((o) => o.id === option.id);

  return (
    <div
      className={[checkClass, "form-check", `form-option-${option.id}`].join(
        " ",
      )}
    >
      <label className="form-check-label" htmlFor={`${path}.${optionIndex}`}>
        <div className="form-input-wrapper">
          <input
            className="form-check-input"
            type="checkbox"
            checked={isChecked}
            disabled={disabled}
            id={`${path}.${optionIndex}`}
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
