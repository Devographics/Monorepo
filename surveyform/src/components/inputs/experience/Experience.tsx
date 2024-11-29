"use client";
import { FormItem } from "~/components/form/FormItem";
import Form from "react-bootstrap/Form";

import { T, useI18n } from "@devographics/react-i18n";
import { FormInputProps } from "~/components/form/typings";
import { FormOption } from "~/components/form/FormOption";

import isEmpty from "lodash/isEmpty.js";
import { useState } from "react";
import { DbPathsEnum, OptionMetadata } from "@devographics/types";
import { getFormPaths } from "@devographics/templates";

import get from "lodash/get.js";
import { FollowupData, FollowUpsTrigger, FollowUps } from "./Followup";
import { useFormStateContext } from "~/components/form/FormStateContext";
import { useFormPropsContext } from "~/components/form/FormPropsContext";
import { CodeExample } from "./Experience2";

export interface ExperienceProps extends FormInputProps {
  showDescription: boolean;
}

export const Experience = (props: ExperienceProps) => {
  const { question } = props;

  const { options, entity } = question;

  return (
    <FormItem {...props}>
      {entity?.example && <CodeExample {...entity.example} />}
      <div className="experience-contents">
        <div className="experience-options">
          {options?.map((option, i) => (
            <ExperienceOption key={i} option={option} i={i} {...props} />
          ))}
        </div>
      </div>
    </FormItem>
  );
};

const ExperienceOption = (
  props: ExperienceProps & { option: OptionMetadata; i: number }
) => {
  const { i, question, option, path, value } = props;
  const { response, updateCurrentValues } = useFormStateContext();
  const { edition, readOnly } = useFormPropsContext();
  const hasValue = !isEmpty(value);
  const { followups } = question;

  const formPaths = getFormPaths({ edition, question });

  // get the paths of the predefined and freeform followup answers
  // inside the overall response document for this specific option
  const predefinedFollowupPath =
    formPaths[DbPathsEnum.FOLLOWUP_PREDEFINED]?.[option.id];
  const freeformFollowupPath =
    formPaths[DbPathsEnum.FOLLOWUP_FREEFORM]?.[option.id];

  const predefinedFollowupValue =
    (predefinedFollowupPath && get(response, predefinedFollowupPath)) || [];
  const freeformFollowupValue =
    (freeformFollowupPath && get(response, freeformFollowupPath)) || "";

  const hasFollowupData =
    !isEmpty(predefinedFollowupValue) || !isEmpty(freeformFollowupValue);
  const [showFollowups, setShowFollowups] = useState(hasFollowupData);

  const followupData: FollowupData = {
    predefinedFollowupPath,
    freeformFollowupPath,
    predefinedFollowupValue,
    freeformFollowupValue,
  };

  const isChecked = value === option.id;
  const checkClass = hasValue
    ? isChecked
      ? "form-check-checked"
      : "form-check-unchecked"
    : "";

  return (
    <div className="form-experience-option">
      <Form.Check
        key={i}
        // layout="elementOnly"
        type="radio"
      >
        <FormCheckLabel htmlFor={`${path}.${i}`}>
          <div className="form-input-wrapper">
            <FormCheckInput
              onClick={(e) => {
                const target = e.target as HTMLInputElement;
                const clickedValue = target.value;
                if (clickedValue === value) {
                  updateCurrentValues({ [path]: null });
                }
              }}
              onChange={(e) => {
                updateCurrentValues({ [path]: e.target.value });
              }}
              type="radio"
              value={option.id}
              name={path}
              id={`${path}.${i}`}
              checked={isChecked}
              className={checkClass}
              disabled={readOnly}
            />
          </div>
          <FormOption {...props} isChecked={isChecked} option={option} />
        </FormCheckLabel>
        {followups && isChecked && (
          <FollowUpsTrigger
            showFollowups={showFollowups}
            setShowFollowups={setShowFollowups}
          />
        )}
      </FormCheck>
      {showFollowups && isChecked && (
        <FollowUps {...props} followupData={followupData} />
      )}
    </div>
  );
};

export default Experience;
