import { PREVIOUS_PARTICIPATIONS } from "@devographics/constants";
import { getRawResponsesCollection } from "@devographics/mongo";
import { PreviousParticipationData } from "@devographics/types";

// how many bulk operation to perform in one go
const operationsPerStep = 1000;

export const addMissingEditionCounts = async (args) => {
  const { surveyId, editionId } = args;
  const Responses = await getRawResponsesCollection();

  const selector = {
    surveyId,
    editionId,
    [`user_info.${PREVIOUS_PARTICIPATIONS}`]: { $exists: false },
  };

  const total = await Responses.countDocuments(selector);
  const totalSteps = Math.floor(total / operationsPerStep);

  console.log(
    `// Found ${total} responses with missing "${PREVIOUS_PARTICIPATIONS}" field, processing…`
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

      const { userId } = response;

      // find all of the user's *other* responses
      const allOtherResponses = await Responses.find({
        userId,
        editionId: { $ne: editionId },
      }).toArray();

      const surveys = [...new Set(allOtherResponses.map((r) => r.surveyId))];
      const editions = allOtherResponses.map((r) => r.editionId);

      const same_survey = allOtherResponses.filter(
        (r) => r.surveyId === surveyId
      );

      const participationData: PreviousParticipationData = {
        surveys,
        editions,
        same_survey_count: same_survey.length,
      };
      const setObject = { [PREVIOUS_PARTICIPATIONS]: participationData };

      bulkOperations.push({
        updateOne: {
          filter: { _id: response._id },
          update: { $set: setObject },
        },
      });
    }

    if (bulkOperations.length > 0) {
      console.log(JSON.stringify(bulkOperations, null, 2));
      const operationResult = await Responses.bulkWrite(bulkOperations, {
        ordered: false,
      });

      console.log("// operationResult:");
      console.log(operationResult);
    }
  }
};

addMissingEditionCounts.args = ["surveyId", "editionId"];

addMissingEditionCounts.description = `Add previous edition counts (how many times someone has taken the same survey before) where missing.`;
