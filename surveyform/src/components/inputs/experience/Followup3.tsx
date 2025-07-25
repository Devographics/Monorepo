/*

Version with simplified sentiment paths

instead of:

css2024__features__at_scope__heard__followup_predefined

use: 

css2024__features__at_scope__sentiment

*/
"use client";

import { T } from "@devographics/react-i18n";

import {
  DbPaths,
  FeaturesOptions,
  OptionMetadata,
  SentimentOptions,
  SimplifiedSentimentOptions,
} from "@devographics/types";
import without from "lodash/without.js";

import { FormInputProps } from "~/components/form/typings";
import { Dispatch, SetStateAction } from "react";
import isEmpty from "lodash/isEmpty";
import { FormCheckInput } from "~/components/form/FormCheck";
import { useFormStateContext } from "~/components/form/FormStateContext";
import { useMessagesContext } from "~/components/common/UserMessagesContext";
import { useQuestionTitle } from "~/lib/surveys/helpers/useQuestionTitle";

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
    section,
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

  const { response } = useFormStateContext();
  const { addMessage } = useMessagesContext();

  const title = useQuestionTitle({ section, question });
  const { tHtml, tClean, t } = title;
  const questionLabel = tHtml || tClean || t;

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

  const readingList = response?.readingList || [];

  const isAlreadyInList = readingList.includes(question.id);

  return sentimentOptions ? (
    <fieldset className={`followups-v3 sentiments ${hasValueClass}`}>
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
            <FormCheckInput
              className="visually-hidden"
              type={followupMode}
              checked={isChecked}
              disabled={readOnly}
              id={`${path}.followup.${index}`}
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
                const isChecked = event.currentTarget.checked;

                if (parentMode === "radio") {
                  // check "main" parent answer
                  updateCurrentValues({ [path]: option.id });
                } else {
                  // add value to "main" parent answer
                  const parentValue = value as Array<number | string>;
                  updateCurrentValues({ [path]: [...parentValue, option.id] });
                }

                const isInterested =
                  [FeaturesOptions.NEVER_HEARD, FeaturesOptions.HEARD].includes(
                    option.id as FeaturesOptions
                  ) &&
                  SimplifiedSentimentOptions.POSITIVE_SENTIMENT ===
                    followupOption.id;

                if (isInterested && isChecked && !isAlreadyInList) {
                  updateCurrentValues({
                    readingList: [...readingList, question.id],
                  });
                  addMessage({
                    type: "success",
                    bodyId: "readinglist.added_to_list",
                    bodyValues: { label: questionLabel },
                  });
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
                // const hasSeenPromptString = localStorage.getItem(
                //   "hasSeenReadingListPrompt"
                // );
                // const hasSeenPrompt =
                //   hasSeenPromptString && JSON.parse(hasSeenPromptString);
                // if (
                //   setHighlightReadingList &&
                //   setShowReadingListPrompt &&
                //   isChecked &&
                //   option.id === FeaturesOptions.HEARD &&
                //   followupOption.id ===
                //     SimplifiedSentimentOptions.POSITIVE_SENTIMENT &&
                //   !hasSeenPrompt
                // ) {
                //   setHighlightReadingList(true);
                //   setShowReadingListPrompt(true);
                //   localStorage.setItem("hasSeenReadingListPrompt", "true");
                // }
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
