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
import { DbPathsEnum, OPTION_NA, OptionMetadata } from "@devographics/types";
import OtherOption from "./OtherOption";
import sortBy from "lodash/sortBy";
import { getFormPaths } from "@devographics/templates";
import get from "lodash/get.js";
import isEmpty from "lodash/isEmpty.js";

import {
  FollowupData,
  FollowUpComment,
  FollowUps,
} from "./experience/Followup2";

const defaultCutoff = 10;
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
  const { value, edition, question, response } = props;
  const hasValue = value?.length > 0;
  const intl = useIntlContext();

  const formPaths = getFormPaths({ edition, question });
  const otherValue = response?.[formPaths.other!];

  const [showMore, setShowMore] = useState(false);
  // keep track of whether "other" field is shown or not
  const [showOther, setShowOther] = useState(!!otherValue);

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

  // either randomize or sort by alphabetical order
  options = randomize
    ? seededShuffle(options, response?._id || "outline")
    : sortBy(options, (option) => option.id);

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
        {naOption && (
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
    response,
    option,
    hasValue,
    hasReachedLimit,
    edition,
    question,
    path,
    updateCurrentValues,
    readOnly,
  } = props;

  //   const { followups } = question;

  const formPaths = getFormPaths({ edition, question });

  // get the paths of the predefined and freeform followup answers
  // inside the overall response document for this specific option
  const allPredefinedFollowupPaths = formPaths[DbPathsEnum.FOLLOWUP_PREDEFINED];
  const predefinedFollowupPath = allPredefinedFollowupPaths?.[option.id];
  const freeformFollowupPath =
    formPaths[DbPathsEnum.FOLLOWUP_FREEFORM]?.[option.id];

  const predefinedFollowupValue =
    (predefinedFollowupPath && get(response, predefinedFollowupPath)) || [];
  const freeformFollowupValue =
    (freeformFollowupPath && get(response, freeformFollowupPath)) || "";

  const hasFollowupData =
    !isEmpty(predefinedFollowupValue) || !isEmpty(freeformFollowupValue);
  const [showFollowupComment, setShowFollowupComment] =
    useState(hasFollowupData);

  const followupData: FollowupData = {
    predefinedFollowupPath,
    freeformFollowupPath,
    predefinedFollowupValue,
    freeformFollowupValue,
  };

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
    <Form.Check
      className={[
        checkClass,
        `form-option-${option.id}`,
        "form-checkbox-option",
      ].join(" ")}
    >
      <Form.Check.Label htmlFor={`${path}.${index}`}>
        <div className="form-input-wrapper">
          <Form.Check.Input
            type="checkbox"
            checked={isChecked}
            disabled={disabled}
            id={`${path}.${index}`}
            name={path}
            value={option.id}
            // ref={refFunction}
            onChange={(event) => {
              const isChecked = event.target.checked;
              const newValue = getNewValue(isChecked);
              updateCurrentValues({ [path]: newValue });
              if (!isChecked) {
                const predefinedFollowupPathString =
                  predefinedFollowupPath as string;
                // if we're unchecking a checkbox, also uncheck its followups
                updateCurrentValues({ [predefinedFollowupPathString]: null });
              }
            }}
          />
        </div>
        <FormOption
          {...props}
          option={option}
          followupData={followupData}
          isNA={isNA}
          value={value}
        />
      </Form.Check.Label>
    </Form.Check>
  );
};
export default FormComponentCheckboxGroup;
