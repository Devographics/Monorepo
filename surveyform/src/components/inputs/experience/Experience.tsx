"use client";
import { FormItem } from "~/components/form/FormItem";
import Form from "react-bootstrap/Form";

import { FormattedMessage } from "~/components/common/FormattedMessage";
import { FormInputProps } from "~/components/form/typings";
import { FormOption } from "~/components/form/FormOption";

import isEmpty from "lodash/isEmpty.js";
import { useState } from "react";
import { Option, OptionMetadata } from "@devographics/types";
import { getFormPaths } from "@devographics/templates";
import without from "lodash/without.js";

import get from "lodash/get.js";

interface ExperienceProps extends FormInputProps {
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
            <ExperienceOption {...props} i={i} option={option} key={i} />
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
  const { i, question, option, path, value, updateCurrentValues, readOnly } =
    props;
  const hasValue = !isEmpty(value);
  const { followups } = question;
  const [showFollowUps, setShowFollowUps] = useState(false);

  const isChecked = value === option.id;
  const checkClass = hasValue
    ? isChecked
      ? "form-check-checked"
      : "form-check-unchecked"
    : "";
  return (
    // @ts-ignore
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
              setShowFollowUps(true);
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
      {followups && isChecked && showFollowUps && <FollowUps {...props} />}
    </Form.Check>
  );
};

const FollowUps = (props: ExperienceProps & { option: OptionMetadata }) => {
  const {
    updateCurrentValues,
    response,
    option,
    edition,
    question,
    readOnly,
    path,
  } = props;
  const { followups = [] } = question;
  const optionFollowUps = followups.find((f) => f.id === option.id)?.options;

  const formPaths = getFormPaths({ edition, question });
  const followupPath = formPaths.followup;

  const followupValue = (followupPath && get(response, followupPath)) || [];

  if (!optionFollowUps || !followupPath) {
    return;
  }
  return (
    <div>
      Optionally, tell us more about your choice:{" "}
      {optionFollowUps.map((followupOption, index) => {
        const isChecked = followupValue?.includes(followupOption.id);
        return (
          <label key={followupOption.id}>
            <Form.Check.Input
              type="checkbox"
              checked={isChecked}
              disabled={readOnly}
              id={`${path}.followup.${index}`}
              // ref={refFunction}
              onChange={(event) => {
                const isChecked = event.target.checked;
                const newValue = isChecked
                  ? [...followupValue, followupOption.id]
                  : without(followupValue, followupOption.id);
                updateCurrentValues({ [followupPath]: newValue });
              }}
            />
            {followupOption.id}
          </label>
        );
      })}
    </div>
  );
};

export default Experience;
