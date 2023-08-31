"use client";
import { FormItem } from "~/components/form/FormItem";
import Form from "react-bootstrap/Form";

import { FormattedMessage } from "~/components/common/FormattedMessage";
import { FormInputProps } from "~/components/form/typings";
import { FormOption } from "~/components/form/FormOption";

import isEmpty from "lodash/isEmpty.js";
import { useState } from "react";
import { DbPathsEnum, OptionMetadata } from "@devographics/types";
import { getFormPaths } from "@devographics/templates";

import get from "lodash/get.js";
import { FollowupData, FollowUpsTrigger, FollowUps } from "./Followup";

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

const CodeExample = ({ language, code, codeHighlighted }) => {
  return (
    <div className="code-example">
      <h5 className="code-example-heading">
        <FormattedMessage id="general.code_example" />
      </h5>
      <pre>
        <code dangerouslySetInnerHTML={{ __html: codeHighlighted }}></code>
      </pre>
    </div>
  );
};

const ExperienceOption = (
  props: ExperienceProps & { option: OptionMetadata; i: number }
) => {
  const {
    i,
    edition,
    response,
    question,
    option,
    path,
    value,
    updateCurrentValues,
    readOnly,
  } = props;
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
        <Form.Check.Label htmlFor={`${path}.${i}`}>
          <div className="form-input-wrapper">
            <Form.Check.Input
              onChange={(e) => {
                updateCurrentValues({ [path]: e.target.value });
              }}
              type="radio"
              value={option.id}
              name={path}
              id={`${path}.${i}`}
              // ref={refFunction}
              checked={isChecked}
              className={checkClass}
              disabled={readOnly}
            />
          </div>
          <FormOption {...props} option={option} />
        </Form.Check.Label>
        {followups && isChecked && (
          <FollowUpsTrigger
            showFollowups={showFollowups}
            setShowFollowups={setShowFollowups}
          />
        )}
      </Form.Check>
      {showFollowups && isChecked && (
        <FollowUps {...props} followupData={followupData} />
      )}
    </div>
  );
};

export default Experience;
