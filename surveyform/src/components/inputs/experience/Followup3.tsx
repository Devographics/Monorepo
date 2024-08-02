/*

Version with simplified sentiment paths

instead of:

css2024__features__at_scope__heard__followup_predefined

use: 

css2024__features__at_scope__sentiment

*/
"use client";
import Form from "react-bootstrap/Form";

import { T, useI18n } from "@devographics/react-i18n";

import {
  DbPaths,
  DbPathsEnum,
  FeaturesOptions,
  OptionMetadata,
  SentimentOptions,
  SimplifiedSentimentOptions,
} from "@devographics/types";
import without from "lodash/without.js";

import { CommentTextarea } from "~/components/form/FormComment";
import { ExperienceProps } from "./Experience";
import { FormInputProps } from "~/components/form/typings";
import { Dispatch, SetStateAction } from "react";
import isEmpty from "lodash/isEmpty";

export interface FollowupData {
  sentimentPath?: string;
  sentimentValue?: string[];
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
  } = props;

  const sentimentOptions = [
    { id: SimplifiedSentimentOptions.POSITIVE_SENTIMENT },
    { id: SimplifiedSentimentOptions.NEGATIVE_SENTIMENT },
  ];

  const { sentimentValue, sentimentPath } = followupData;

  if (!sentimentPath) {
    throw new Error(`Could not find sentimentPath for question ${question.id}`);
  }

  const parentMode =
    question.template === "multipleWithOtherSentiment" ? "checkbox" : "radio";

  const hasValueClass = !isEmpty(sentimentValue)
    ? "has-selected"
    : "none-selected";

  const roleProp = optionIsChecked ? {} : { role: "presentation" };

  const tabIndexProp = optionIsChecked ? {} : { tabIndex: -1 };

  return sentimentOptions ? (
    <fieldset className={`followups-v2 sentiments ${hasValueClass}`}>
      <legend className="sr-only">
        <T token="followups.description.short" />
      </legend>
      {sentimentOptions.map((followupOption, index) => {
        const isChecked = sentimentValue?.includes(followupOption.id);
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
                  sentimentValue?.includes(followupOption.id)
                ) {
                  updateCurrentValues({ [sentimentPath]: null });
                }
              }}
              onChange={(event) => {
                const isChecked = event.target.checked;

                if (parentMode === "radio") {
                  // check "main" parent answer
                  updateCurrentValues({ [path]: option.id });
                } else {
                  // add value to "main" parent answer
                  const parentValue = value as Array<number | string>;
                  updateCurrentValues({ [path]: [...parentValue, option.id] });
                }

                if (followupMode === "checkbox") {
                  // checkbox version
                  const newValue = isChecked
                    ? [...sentimentValue!, followupOption.id]
                    : without(sentimentValue, followupOption.id);
                } else {
                  // radio button version
                  const newValue = isChecked ? followupOption.id : null;
                  updateCurrentValues({
                    [sentimentPath]: newValue,
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
                  option.id === FeaturesOptions.HEARD &&
                  followupOption.id ===
                    SimplifiedSentimentOptions.POSITIVE_SENTIMENT &&
                  !hasSeenPrompt
                ) {
                  setHighlightReadingList(true);
                  setShowReadingListPrompt(true);
                  localStorage.setItem("hasSeenReadingListPrompt", "true");
                }
              }}
            />
            <span className="sentiment-icon" aria-hidden={true} />
            <T
              token={`options.sentiment.${option.id}.${followupOption.id}.label`}
              className="sentiment-label"
            />
          </label>
        );
      })}
    </fieldset>
  ) : null;
};
