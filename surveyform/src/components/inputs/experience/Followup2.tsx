"use client";
import Form from "react-bootstrap/Form";

import { FormattedMessage } from "~/components/common/FormattedMessage";

import { OptionMetadata } from "@devographics/types";
import without from "lodash/without.js";

import { Button } from "~/components/ui/Button";
import { CommentTextarea } from "~/components/form/FormComment";
import { useIntlContext } from "@devographics/react-i18n";
import { ExperienceProps } from "./Experience";

export interface FollowupData {
  predefinedFollowupPath?: string;
  freeformFollowupPath?: string;
  predefinedFollowupValue?: string[];
  freeformFollowupValue?: string;
}

export const FollowUps = (
  props: ExperienceProps & {
    option: OptionMetadata;
    followupData: FollowupData;
  }
) => {
  const {
    updateCurrentValues,
    option,
    question,
    readOnly,
    path,
    followupData,
  } = props;
  const { followups = [] } = question;
  const optionFollowUps = followups.find((f) => f.id === option.id)?.options;

  const { predefinedFollowupValue, predefinedFollowupPath } = followupData;

  if (!predefinedFollowupPath) {
    throw new Error(
      `Could not find predefinedFollowupPath for question ${question.id}`
    );
  }

  // const followUpPath
  return optionFollowUps ? (
    <div className="followups-v2 sentiments">
      {optionFollowUps.map((followupOption, index) => {
        const isChecked = predefinedFollowupValue?.includes(followupOption.id);
        const sentimentClasses = ["positive", "negative"];
        return (
          <label
            key={followupOption.id}
            className={`followups-predefined-label2 sentiment ${sentimentClasses[index]}`}
          >
            <Form.Check.Input
              className="visually-hidden"
              type="checkbox"
              checked={isChecked}
              disabled={readOnly}
              id={`${path}.followup.${index}`}
              // ref={refFunction}
              onChange={(event) => {
                const isChecked = event.target.checked;

                // check "main" parent answer
                updateCurrentValues({ [path]: option.id });

                // checkbox version
                // const newValue = isChecked
                //   ? [...predefinedFollowupValue!, followupOption.id]
                //   : without(predefinedFollowupValue, followupOption.id);

                // radio button version
                const newValue = isChecked ? [followupOption.id] : [];
                updateCurrentValues({
                  [predefinedFollowupPath]: newValue,
                });
              }}
            />
            <span className="sentiment-label">
              <FormattedMessage id={`followups.${followupOption.id}`} />
            </span>
          </label>
        );
      })}
    </div>
  ) : null;
};

export const FollowUpComment = (
  props: ExperienceProps & {
    option: OptionMetadata;
    followupData: FollowupData;
  }
) => {
  const {
    updateCurrentValues,
    option,
    question,
    readOnly,
    path,
    followupData,
  } = props;

  const { freeformFollowupValue, freeformFollowupPath } = followupData;

  if (!freeformFollowupPath) {
    throw new Error(
      `Could not find freeformFollowupPath for question ${question.id}`
    );
  }

  const intl = useIntlContext();
  const placeholder = intl.formatMessage({ id: `followups.placeholder` });

  return (
    <div className="form-input-followups-freeform">
      <CommentTextarea
        readOnly={!!readOnly}
        value={freeformFollowupValue!}
        path={freeformFollowupPath}
        placeholder={placeholder}
      />
    </div>
  );
};
