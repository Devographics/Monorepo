"use client";

import { T, useI18n } from "@devographics/react-i18n";

import { OptionMetadata } from "@devographics/types";
import without from "lodash/without.js";

import { Button } from "~/components/ui/Button";
import { CommentTextarea } from "~/components/form/FormComment";
import { ExperienceProps } from "./Experience";
import { FormCheckInput } from "~/components/form/FormCheck";

export interface FollowupData {
  predefinedFollowupPath?: string;
  freeformFollowupPath?: string;
  predefinedFollowupValue?: string[];
  freeformFollowupValue?: string;
}

export const FollowUpsTrigger = ({ showFollowups, setShowFollowups }) => {
  return (
    <Button
      className="form-input-followups-trigger"
      size="sm"
      onClick={() => {
        setShowFollowups(!showFollowups);
      }}
    >
      <T token="followups.button" />
    </Button>
  );
};

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

  const {
    predefinedFollowupValue,
    predefinedFollowupPath,
    freeformFollowupValue,
    freeformFollowupPath,
  } = followupData;

  if (!predefinedFollowupPath || !freeformFollowupPath) {
    throw new Error(
      `Could not find predefinedFollowupPath or freeformFollowupPath for question ${question.id}`
    );
  }

  const { t } = useI18n();
  const placeholder = t(`followups.placeholder`);

  return (
    <div className="followups">
      <h5>
        <T token="followups.description" />
      </h5>
      {optionFollowUps && (
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
                  <FormCheckInput
                    type="checkbox"
                    checked={isChecked}
                    disabled={readOnly}
                    id={`${path}.followup.${index}`}
                    onChange={(event) => {
                      const isChecked = event.currentTarget.checked;
                      const newValue = isChecked
                        ? [...predefinedFollowupValue!, followupOption.id]
                        : without(predefinedFollowupValue, followupOption.id);
                      updateCurrentValues({
                        [predefinedFollowupPath]: newValue,
                      });
                    }}
                  />
                  <span>
                    <T token={`followups.${followupOption.id}`} />
                  </span>
                </label>
              </Button>
            );
          })}
        </div>
      )}
      <div className="form-input-followups-freeform">
        <CommentTextarea
          readOnly={!!readOnly}
          value={freeformFollowupValue!}
          path={freeformFollowupPath}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};
