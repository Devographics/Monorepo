"use client";
import Form from "react-bootstrap/Form";

import { FormattedMessage } from "~/components/common/FormattedMessage";

import {
  DbPaths,
  DbPathsEnum,
  OptionMetadata,
  SentimentOptions,
} from "@devographics/types";
import without from "lodash/without.js";

import { Button } from "~/components/ui/Button";
import { CommentTextarea } from "~/components/form/FormComment";
import { useIntlContext } from "@devographics/react-i18n";
import { ExperienceProps } from "./Experience";
import { FormInputProps } from "~/components/form/typings";
import { Dispatch, SetStateAction } from "react";
import isEmpty from "lodash/isEmpty";

export interface FollowupData {
  predefinedFollowupPath?: string;
  freeformFollowupPath?: string;
  predefinedFollowupValue?: string[];
  freeformFollowupValue?: string;
}

export const FollowUps = (
  props: FormInputProps & {
    parentHasValue?: boolean;
    optionIsChecked: boolean;
    option: OptionMetadata;
    followupData: FollowupData;
    highlightReadingList?: boolean;
    setHighlightReadingList?: Dispatch<SetStateAction<boolean>>;
    showReadingListPrompt?: boolean;
    setShowReadingListPrompt?: Dispatch<SetStateAction<boolean>>;
    followupMode?: "radio" | "checkbox";
    formPaths?: DbPaths;
  }
) => {
  const {
    updateCurrentValues,
    option,
    question,
    readOnly,
    path,
    followupData,
    value,
    setHighlightReadingList,
    setShowReadingListPrompt,
    optionIsChecked,
    followupMode = "radio",
    formPaths,
  } = props;

  const { followups = [] } = question;
  const optionFollowUps = followups.find(
    (f) => f.id === option.id || f.id === "default"
  )?.options;

  const { predefinedFollowupValue, predefinedFollowupPath } = followupData;

  if (!predefinedFollowupPath) {
    throw new Error(
      `Could not find predefinedFollowupPath for question ${question.id}`
    );
  }

  const parentMode =
    question.template === "multipleWithOtherSentiment" ? "checkbox" : "radio";

  const hasValueClass = !isEmpty(predefinedFollowupValue)
    ? "has-selected"
    : "none-selected";

  const roleProp = optionIsChecked
    ? { role: followupMode }
    : { role: "presentation" };

  const tabIndexProp = optionIsChecked ? {} : { tabIndex: -1 };

  const allPredefinedFollowupPaths =
    formPaths?.[DbPathsEnum.FOLLOWUP_PREDEFINED];

  return optionFollowUps ? (
    <fieldset className={`followups-v2 sentiments ${hasValueClass}`}>
      <legend className="sr-only">
        <FormattedMessage id="followups.description.short" />
      </legend>
      {optionFollowUps.map((followupOption, index) => {
        const isChecked = predefinedFollowupValue?.includes(followupOption.id);
        const sentimentClasses = ["positive", "negative"];
        const isCheckedClass = isChecked ? "is-selected" : "is-not-selected";
        return (
          <label
            key={followupOption.id}
            className={`followups-predefined-label2 sentiment ${sentimentClasses[index]} ${isCheckedClass}`}
            {...roleProp}
          >
            <Form.Check.Input
              className="visually-hidden"
              type={followupMode}
              checked={isChecked}
              disabled={readOnly}
              id={`${path}.followup.${index}`}
              // ref={refFunction}
              {...tabIndexProp}
              onClick={(event) => {
                // if follow up option is already part of the selected options,
                // remove it on click (radio mode only)
                if (
                  followupMode === "radio" &&
                  predefinedFollowupValue?.includes(followupOption.id)
                ) {
                  updateCurrentValues({ [predefinedFollowupPath]: null });
                }
              }}
              onChange={(event) => {
                const isChecked = event.target.checked;

                if (parentMode === "radio") {
                  // check "main" parent answer
                  updateCurrentValues({ [path]: option.id });
                  if (allPredefinedFollowupPaths) {
                    // when a follow-up is clicked, also clear all other predefined follow-ups
                    for (const followUpPath of Object.values(
                      allPredefinedFollowupPaths
                    )) {
                      updateCurrentValues({ [followUpPath]: null });
                    }
                  }
                } else {
                  // add value to "main" parent answer
                  const parentValue = value as Array<number | string>;
                  updateCurrentValues({ [path]: [...parentValue, option.id] });
                }

                if (followupMode === "checkbox") {
                  // checkbox version
                  const newValue = isChecked
                    ? [...predefinedFollowupValue!, followupOption.id]
                    : without(predefinedFollowupValue, followupOption.id);
                } else {
                  // radio button version
                  const newValue = isChecked ? [followupOption.id] : [];
                  updateCurrentValues({
                    [predefinedFollowupPath]: newValue,
                  });
                }

                // show reading list prompt if needed
                const hasSeenPromptString = localStorage.getItem(
                  "hasSeenReadingListPrompt"
                );
                const hasSeenPrompt =
                  hasSeenPromptString && JSON.parse(hasSeenPromptString);
                if (
                  setHighlightReadingList &&
                  setShowReadingListPrompt &&
                  isChecked &&
                  followupOption.id === SentimentOptions.INTERESTED &&
                  !hasSeenPrompt
                ) {
                  setHighlightReadingList(true);
                  setShowReadingListPrompt(true);
                  localStorage.setItem("hasSeenReadingListPrompt", "true");
                }
              }}
            />
            <span className="sentiment-icon" aria-hidden={true} />
            <FormattedMessage
              id={`followups.${followupOption.id}`}
              className="sentiment-label"
            />
          </label>
        );
      })}
    </fieldset>
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
