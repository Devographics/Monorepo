/*

By default, sentiment is stored as follow-up data with the following structure:

{
  "features": {
    "media_capture": {
      "experience": "never_heard",
      "followups": {
        "never_heard": {
          "followup_predefined": ["sentiment_interested"]
        }
      }
    }
  }
}

This copies over sentiment data to a structure that's easier to deal with:

{
  "features": {
    "media_capture": {
      "experience": "never_heard",
      "followups": {
        "never_heard": {
          "followup_predefined": ["sentiment_interested"]
        }
      },
      "sentiment": ["sentiment_interested"]  // <------ here
    }
  }
}

*/
import {
  NEGATIVE_SENTIMENT,
  NEUTRAL_SENTIMENT,
  POSITIVE_SENTIMENT,
} from "@devographics/constants";
import { getNormResponsesCollection } from "@devographics/mongo";
import {
  QuestionWithSection,
  SentimentOptions,
  FeaturesOptions,
  QuestionTemplateOutputWithSection,
} from "@devographics/types";
import get from "lodash/get";
import uniq from "lodash/uniq";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import { getEditionQuestions } from "~/lib/normalization/helpers/getEditionQuestions";
import { getQuestionObject } from "~/lib/normalization/helpers/getQuestionObject";

// how many bulk operation to perform in one go
const operationsPerStep = 1000;

/*

Test if an option is one of the predefined sentiment options

*/
const isSentimentOption = (option: string) =>
  (Object.values(SentimentOptions) as string[]).includes(option);

/*

A question is a sentiment question if it has followups defined, 
and if the follow-ups all use sentiment options.

Also limit to featurev3 questions for now

*/
const isSentimentQuestion = (question: QuestionWithSection) => {
  return (
    question.template === "featurev3" &&
    question.followups &&
    question.followups.every((followup) =>
      followup.options.every((option) => isSentimentOption(option.id))
    )
  );
};

/*

Get sentiment path

*/
const getSentimentPath = (question: QuestionTemplateOutputWithSection) => {
  const { normPaths } = question;
  return normPaths?.sentiment;
};

const positiveSentimentOptions = [
  SentimentOptions.INTERESTED,
  SentimentOptions.POSITIVE_EXPERIENCE,
];
const negativeSentimentOptions = [
  SentimentOptions.NOT_INTERESTED,
  SentimentOptions.NEGATIVE_EXPERIENCE,
];

export async function addSentiment({
  surveyId,
  editionId,
}: {
  surveyId: string;
  editionId: string;
}) {
  const fields: any[] = [];

  const normalizedResponses = await getNormResponsesCollection();
  const { data: edition } = await fetchEditionMetadataAdmin({
    surveyId,
    editionId,
  });

  const editionQuestions = getEditionQuestions(edition);

  const sentimentQuestions = editionQuestions
    .filter(isSentimentQuestion)
    .map((question) =>
      getQuestionObject({
        survey: edition.survey,
        edition,
        section: question.section,
        question,
      })
    );

  const selector = { editionId };

  /*
  
  start by removing all previously set sentiments
  
  */
  const removeOperation = [
    {
      $unset: sentimentQuestions.map(getSentimentPath),
    },
  ];

  const removeDbResult = await normalizedResponses.updateMany(
    selector,
    removeOperation
  );

  const badlyFormattedResponses: string[] = [];

  /*

  Get all responses and iterate on them

  */
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

      const setObject = {};
      for (const question of sentimentQuestions) {
        const { normPaths } = question;
        const experienceValue = get(response, normPaths?.response!);
        if (experienceValue) {
          const followupPath =
            normPaths?.followup_predefined?.[experienceValue]!;
          let followupValue = get(response, followupPath);
          let sentimentValue;
          if (followupValue) {
            if (Array.isArray(followupValue)) {
              followupValue = followupValue[0];
            } else {
              // console.log(
              //   `// found non-array follow-up for response _id: ${response._id} and field ${followupPath}`
              // );
              badlyFormattedResponses.push(response._id);
            }
            if (positiveSentimentOptions.includes(followupValue)) {
              sentimentValue = POSITIVE_SENTIMENT;
            } else {
              sentimentValue = NEGATIVE_SENTIMENT;
            }
          } else {
            sentimentValue = NEUTRAL_SENTIMENT;
          }
          const sentimentPath = getSentimentPath(question)!;
          setObject[sentimentPath] = sentimentValue;
        }
      }
      bulkOperations.push({
        updateOne: {
          filter: { _id: response._id },
          update: { $set: setObject },
        },
      });
    }
    const operationResult = await normalizedResponses.bulkWrite(
      bulkOperations,
      {
        ordered: false,
      }
    );

    console.log("// operationResult:");
    console.log(operationResult);
  }
  console.log("// badly formatted responses:");
  console.log(uniq(badlyFormattedResponses));
  return { fields };
}
