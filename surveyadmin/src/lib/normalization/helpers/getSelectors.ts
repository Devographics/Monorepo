import {
  SurveyMetadata,
  EditionMetadata,
  QuestionTemplateOutput,
} from "@devographics/types";
import { getFormPaths } from "@devographics/templates";
import { getQuestionObject } from "./getQuestionObject";
import type { QuestionWithSection } from "~/lib/normalization/types";

export const getSourceFields = (surveyId) => [
  "common__user_info__referrer",
  "common__user_info__source",
  `${surveyId}__user_info__how_did_user_find_out_about_the_survey`,
];

/*

Clean up values to remove 'none', 'n/a', etc.

*/
export const ignoreValues = [
  "",
  " ",
  "  ",
  "   ",
  "    ",
  "     ",
  "      ",
  "\n",
  "\n\n",
  "/",
  "\\",
  "*",
  "+",
  "-",
  "—",
  "n/a",
  "N/A",
  "N/a",
  "NA",
  "na",
  "Na",
  "None",
  "none",
  "Nothing",
  "nothing",
  "No",
  "no",
  ".",
  "?",
  "ninguna",
  "ninguno",
  "nope",
  "No comment",
  "No Comment",
  "no comment",
  "Nil",
  "nil",
  "undefined",
];

/*

Note: `$elemMatch: { $ne: "" }` matches all arrays that include at least
one item that is not equal to "" (i.e. not an empty strings)

*/
type SelectorOptions = {
  isArray?: boolean;
};
export const getExistsSelector = (options: SelectorOptions = {}) => {
  const { isArray = false } = options;
  const selector = {
    $exists: true,
  };
  if (isArray) {
    selector["$elemMatch"] = { $nin: ignoreValues };
  } else {
    selector["$nin"] = ignoreValues;
  }
  return selector;
};

export const getUnnormalizedResponsesSelector = ({
  edition,
  questionObject,
}: {
  edition: EditionMetadata;
  questionObject: QuestionTemplateOutput;
}) => {
  const rawFieldPath = questionObject?.normPaths?.raw;
  const normalizedFieldPath = questionObject?.normPaths?.other;
  // TODO: do this better
  // currently the textList template is the only one that supports multiple
  // freeform values
  const existsSelector = getExistsSelector({
    isArray: questionObject.template === "textList",
  });
  if (rawFieldPath && normalizedFieldPath) {
    const selector = {
      editionId: edition.id,
      [rawFieldPath]: existsSelector,
      $or: [
        { [normalizedFieldPath]: [] },
        { [normalizedFieldPath]: { $exists: false } },
      ],
    };
    return selector;
  } else {
    throw new Error(
      `getUnnormalizedResponsesSelector: Missing rawFieldPath or normalizedFieldPath for question ${questionObject.id}`
    );
  }
};

export const getAllResponsesSelector = ({
  edition,
  questionObject,
}: {
  edition: EditionMetadata;
  questionObject: QuestionTemplateOutput;
}) => {
  const rawFieldPath = questionObject?.normPaths?.raw;
  const normalizedFieldPath = questionObject?.normPaths?.other;
  // TODO: do this better
  // currently the textList template is the only one that supports multiple
  // freeform values
  const existsSelector = getExistsSelector({
    isArray: questionObject.template === "textList",
  });
  if (rawFieldPath && normalizedFieldPath) {
    const selector = {
      editionId: edition.id,
      [rawFieldPath]: existsSelector,
    };
    return selector;
  } else {
    throw new Error(
      `getAllResponsesSelector: Missing rawFieldPath or normalizedFieldPath for question ${questionObject.id}`
    );
  }
};

// get mongo selector
export const getEditionSelector = async ({
  survey,
  edition,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
}) => {
  const selector = {
    editionId: edition.id,
  };
  return selector;
};

// TODO getResponsesSelector and getSelector do the same thing; clean up and merge
export const getResponsesSelector = ({
  edition,
  questionObject,
}: {
  edition: EditionMetadata;
  questionObject: QuestionTemplateOutput;
}) => {
  const formPaths = getFormPaths({ edition, question: questionObject });
  // TODO: do this better
  // currently the textList template is the only one that supports multiple
  // freeform values
  const isArray = questionObject.template === "textList";
  if (formPaths.other) {
    const selector = {
      editionId: edition.id,
      [formPaths.other]: getExistsSelector({ isArray }),
    };
    return selector;
  } else {
    throw new Error(
      `getResponsesSelector: Missing formPaths.other for question ${questionObject.id}`
    );
  }
};

// get mongo selector
export const getSelector = async ({
  survey,
  edition,
  question,
  onlyUnnormalized,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question?: QuestionWithSection;
  onlyUnnormalized?: boolean;
}) => {
  const selector = {
    editionId: edition.id,
  } as any;

  if (question) {
    const questionObject = getQuestionObject({
      survey,
      edition,
      section: question.section,
      question,
    });
    if (questionObject) {
      if (onlyUnnormalized) {
        // const { responses } = await getUnnormalizedResponses({
        //   survey
        //   edition,
        //   question
        // });
        // const unnormalizedIds = responses.map((r) => r.responseId);
        // selector._id = { $in: unnormalizedIds };
      } else {
        if (question.id === "source") {
          // source field should be treated differently
          selector["$or"] = getSourceFields(edition.id).map((f) => ({
            [f]: getExistsSelector(),
          }));
        } else {
          const formPaths = getFormPaths({ edition, question: questionObject });
          if (formPaths.other) {
            selector[formPaths.other] = getExistsSelector();
          }
        }
      }
    }
  } else {
    if (onlyUnnormalized) {
      selector.isNormalized = { $ne: true };
    } else {
      // do nothing, use default selector
    }
  }
  // console.log("// selector");
  // console.log(JSON.stringify(selector, undefined, 2));
  return selector;
};
