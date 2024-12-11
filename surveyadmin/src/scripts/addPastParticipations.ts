import { PAST_PARTICIPATIONS } from "@devographics/constants";
import { getRawResponsesCollection } from "@devographics/mongo";
import { OtherParticipationData } from "@devographics/types";

// how many bulk operations to perform in one go
const operationsPerStep = 1000;

export const addPastParticipations = async (args) => {
  const { surveyId, editionId } = args;
  const Responses = await getRawResponsesCollection();

  // exclude users taking the survey as guests since we won't
  // be able to attach their account to any other responses
  const selector = {
    surveyId,
    editionId,
    [PAST_PARTICIPATIONS]: { $exists: false },
    common__user_info__authmode: { $ne: "anonymous" },
  };

  const total = await Responses.countDocuments(selector);
  const totalSteps = Math.floor(total / operationsPerStep);

  console.log(
    `// Found ${total} responses for edition ${editionId} with missing "${PAST_PARTICIPATIONS}" field, processing…`
  );

  for (let step = 0; step <= totalSteps; step++) {
    console.log(
      `// Processing responses ${step * operationsPerStep}-${
        (step + 1) * operationsPerStep
      } out of ${total}…`
    );

    const bulkOperations: any[] = [];

    const responses = await Responses.find(selector)
      .skip(step * operationsPerStep)
      .limit(operationsPerStep);

    let count = 0;
    for await (const response of responses) {
      count++;

      const { userId, createdAt } = response;

      // find all of the user's *past* responses
      // (compared to the current edition)
      const allOtherResponses = await Responses.find({
        userId,
        editionId: { $ne: editionId },
        createdAt: { $lt: createdAt },
      }).toArray();

      const surveys = [...new Set(allOtherResponses.map((r) => r.surveyId))];
      const editions = allOtherResponses.map((r) => r.editionId);

      const same_survey = allOtherResponses.filter(
        (r) => r.surveyId === surveyId
      );

      const participationData: OtherParticipationData = {
        surveys,
        editions,
        same_survey_count: same_survey.length,
      };
      const setObject = { [PAST_PARTICIPATIONS]: participationData };

      bulkOperations.push({
        updateOne: {
          filter: { _id: response._id },
          update: { $set: setObject },
        },
      });
    }

    if (bulkOperations.length > 0) {
      const operationResult = await Responses.bulkWrite(bulkOperations, {
        ordered: false,
      });

      console.log("// operationResult:");
      console.log(operationResult);
    }
  }
};

addPastParticipations.args = ["surveyId", "editionId"];

addPastParticipations.description = `Add previous edition counts (how many times someone has taken the same survey before) where missing.`;
