/*

Convert from old format:

options: 
    - would_use
    - would_not_use
    - interested
    - not_interested
    - never_heard

example:
    { 
        experience: "would_use" 
    }

To new format:

options: 
    - never_heard
    - heard
    - used

example:
    { 
        experienceLegacy: "would_use" ,
        experience: "used",
        // followups:  {
        //    would_use: {
        //        followup_predefined: ["sentiment_positive_experience"]
        //    }
        // },
        sentiment: "positive"
    }

note: we don't actually need to add the `followups` data structure since only the simplified
`sentiment` (otherwise created by addSentiment.ts) is used in the end

*/

import { getNormResponsesCollection } from "@devographics/mongo";
import {
  FeaturesOptions,
  QuestionWithSection,
  SentimentOptions,
  ToolsOptions,
} from "@devographics/types";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import { getEditionQuestions } from "./getEditionQuestions";
import { getQuestionObject } from "./getQuestionObject";
import get from "lodash/get";
import {
  NEGATIVE_SENTIMENT,
  NEUTRAL_SENTIMENT,
  POSITIVE_SENTIMENT,
} from "@devographics/constants";

// how many bulk operation to perform in one go
const operationsPerStep = 1000;

const conversionTable = {
  [ToolsOptions.NEVER_HEARD]: {
    experience: FeaturesOptions.NEVER_HEARD,
    sentiment: NEUTRAL_SENTIMENT,
  },
  [ToolsOptions.INTERESTED]: {
    experience: FeaturesOptions.HEARD,
    sentiment: POSITIVE_SENTIMENT,
  },
  [ToolsOptions.NOT_INTERESTED]: {
    experience: FeaturesOptions.HEARD,
    sentiment: NEGATIVE_SENTIMENT,
  },
  [ToolsOptions.WOULD_USE]: {
    experience: FeaturesOptions.USED,
    sentiment: POSITIVE_SENTIMENT,
  },
  [ToolsOptions.WOULD_NOT_USE]: {
    experience: FeaturesOptions.USED,
    sentiment: NEGATIVE_SENTIMENT,
  },
};

const isToolQuestion = (question: QuestionWithSection) =>
  question.template === "tool";

export async function convertExperience({
  surveyId,
  editionId,
}: {
  surveyId: string;
  editionId: string;
}) {
  // note: only do it for tools, for now

  const normalizedResponses = await getNormResponsesCollection();
  const { data: edition } = await fetchEditionMetadataAdmin({
    surveyId,
    editionId,
    shouldGetFromCache: false,
  });

  const editionQuestions = getEditionQuestions(edition);

  const toolQuestions = editionQuestions
    .filter(isToolQuestion)
    .map((question) =>
      getQuestionObject({
        survey: edition.survey,
        edition,
        section: question.section,
        question,
      })
    );

  if (toolQuestions.length === 0) {
    throw new Error(`// convertExperience: no tool questions found`);
  } else {
    console.log(
      `// convertExperience: found ${toolQuestions.length} tool questions`
    );
  }

  const selector = { editionId };

  const total = await normalizedResponses.countDocuments(selector);
  const totalSteps = Math.floor(total / operationsPerStep);

  for (let step = 0; step <= totalSteps; step++) {
    console.log(
      `// Processing responses ${step * operationsPerStep}-${
        (step + 1) * operationsPerStep
      } out of ${total}…`
    );

    const allResponses = await normalizedResponses
      .find(selector)
      .skip(step * operationsPerStep)
      .limit(operationsPerStep);

    const bulkOperations: any[] = [];
    let count = 0;
    for await (const response of allResponses) {
      count++;

      if (response.tools) {
        // if response doesn't have any tools we can just skip it

        const setObject = {};
        for (const question of toolQuestions) {
          const { normPaths } = question;
          const experiencePath = normPaths?.response!;
          const sentimentPath = normPaths?.sentiment!;
          const experienceLegacyPath = experiencePath + "Legacy";
          // value stored in "experience" field
          const experienceValue = get(response, experiencePath);
          // value stored in "experienceLegacy" field
          const legacyValue = get(response, experienceLegacyPath);
          // if a legacyValue exists use it, else use regular value
          const oldExperienceValue = legacyValue || experienceValue;
          if (oldExperienceValue) {
            const conversion = conversionTable[oldExperienceValue];
            if (conversion) {
              const { experience: newExperience, sentiment } = conversion;
              setObject[experiencePath] = newExperience;
              setObject[experienceLegacyPath] = oldExperienceValue;
              setObject[sentimentPath] = sentiment;
            } else {
              console.log(`// skipping value ${oldExperienceValue}`);
            }
          }
        }
        bulkOperations.push({
          updateOne: {
            filter: { _id: response._id },
            update: { $set: setObject },
          },
        });
      }
    }
    if (bulkOperations.length > 0) {
      const operationResult = await normalizedResponses.bulkWrite(
        bulkOperations,
        {
          ordered: false,
        }
      );

      console.log("// operationResult:");
      console.log(operationResult);
    }
  }
}
