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

  const intl = useIntlContext();

  const placeholder = intl.formatMessage({ id: `followups.placeholder` });

  return (
    <div className="followups">
      <h5>
        <FormattedMessage id="followups.description" />
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
                  <Form.Check.Input
                    type="checkbox"
                    checked={isChecked}
                    disabled={readOnly}
                    id={`${path}.followup.${index}`}
                    // ref={refFunction}
                    onChange={(event) => {
                      const isChecked = event.target.checked;
                      const newValue = isChecked
                        ? [...predefinedFollowupValue!, followupOption.id]
                        : without(predefinedFollowupValue, followupOption.id);
                      updateCurrentValues({
                        [predefinedFollowupPath]: newValue,
                      });
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
