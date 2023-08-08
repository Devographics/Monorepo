"use client";
import { FormItem } from "~/components/form/FormItem";
import Form from "react-bootstrap/Form";

import { FormattedMessage } from "~/components/common/FormattedMessage";
import { FormInputProps } from "~/components/form/typings";
import { FormOption } from "~/components/form/FormOption";

import isEmpty from "lodash/isEmpty.js";
<<<<<<< Updated upstream
=======
import { useState } from "react";
import { DbPathsEnum, Option, OptionMetadata } from "@devographics/types";
import { getFormPaths } from "@devographics/templates";
import without from "lodash/without.js";

import get from "lodash/get.js";
import { Button } from "~/components/ui/Button";
import { CommentInput, CommentTextarea } from "~/components/form/FormComment";
import { useIntlContext } from "@devographics/react-i18n";
>>>>>>> Stashed changes

interface ExperienceProps extends FormInputProps {
  showDescription: boolean;
}

export const Experience = (props: ExperienceProps) => {
  const { path, value, question, updateCurrentValues, readOnly } = props;

  const { options, entity } = question;

  const hasValue = !isEmpty(value);

  return (
    <FormItem {...props}>
      {entity?.example && <CodeExample {...entity.example} />}
      <div className="experience-contents">
        <div className="experience-options">
          {options?.map((option, i) => {
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
              </Form.Check>
            );
          })}
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

<<<<<<< Updated upstream
=======
const ExperienceOption = (
  props: ExperienceProps & { option: OptionMetadata; i: number }
) => {
  const { i, question, option, path, value, updateCurrentValues, readOnly } =
    props;
  const hasValue = !isEmpty(value);
  const { followups } = question;
  const [showFollowups, setShowFollowups] = useState(false);

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
      {showFollowups && isChecked && <FollowUps {...props} />}
    </div>
  );
};

const FollowUpsTrigger = ({ showFollowups, setShowFollowups }) => {
  return (
    <Button
      className="form-input-followups-trigger"
      size="sm"
      onClick={() => {
        setShowFollowups(!showFollowups);
      }}
    >
      <FormattedMessage id="followups.button" />
    </Button>
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

  const intl = useIntlContext();

  const formPaths = getFormPaths({ edition, question });
  const predefinedFollowupPath = formPaths[DbPathsEnum.FOLLOWUP_PREDEFINED];
  const freeformFollowupPath = formPaths[DbPathsEnum.FOLLOWUP_FREEFORM];

  if (!optionFollowUps || !predefinedFollowupPath || !freeformFollowupPath) {
    return;
  }

  const predefinedFollowupValue =
    (predefinedFollowupPath && get(response, predefinedFollowupPath)) || [];
  const freeformFollowupValue =
    (freeformFollowupPath && get(response, freeformFollowupPath)) || "";

  const placeholder = intl.formatMessage({ id: `followups.placeholder` });

  return (
    <div className="followups">
      <h5>
        <FormattedMessage id="followups.description" />
      </h5>
      <div className="followups-predefined">
        {optionFollowUps.map((followupOption, index) => {
          const isChecked = predefinedFollowupValue?.includes(
            followupOption.id
          );
          return (
            <Button
              key={followupOption.id}
              className="followups-predefined-item"
              size="sm"
            >
              <label className="followups-predefined-label">
                <Form.Check.Input
                  type="checkbox"
                  checked={isChecked}
                  disabled={readOnly}
                  id={`${path}.followup.${index}`}
                  // ref={refFunction}
                  onChange={(event) => {
                    const isChecked = event.target.checked;
                    const newValue = isChecked
                      ? [...predefinedFollowupValue, followupOption.id]
                      : without(predefinedFollowupValue, followupOption.id);
                    updateCurrentValues({ [predefinedFollowupPath]: newValue });
                  }}
                />
                <span>
                  <FormattedMessage id={`followups.${followupOption.id}`} />
                </span>
              </label>
            </Button>
          );
        })}
      </div>
      <div className="form-input-followups-freeform">
        <CommentTextarea
          readOnly={!!readOnly}
          value={freeformFollowupValue}
          path={freeformFollowupPath}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

>>>>>>> Stashed changes
export default Experience;
