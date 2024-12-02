import { PREVIOUS_PARTICIPATIONS } from "@devographics/constants";
import { getRawResponsesCollection } from "@devographics/mongo";
import { PreviousParticipationData } from "@devographics/types";

// how many bulk operation to perform in one go
const operationsPerStep = 1000;

export const addCreatedAtDate = async (args) => {
  const { surveyId, editionId } = args;
  const Responses = await getRawResponsesCollection();

  const selector = {
    surveyId,
    editionId,
    createdAtDate: { $exists: false },
  };

  const total = await Responses.countDocuments(selector);
  const totalSteps = Math.floor(total / operationsPerStep);

  console.log(
    `// Found ${total} responses with missing createdAtDate field, processing…`
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

      const { createdAt } = response;

      let date = new Date(createdAt);
      date.setUTCHours(0, 0, 0, 0);
      const setObject = { createdAtDate: date };

      bulkOperations.push({
        updateOne: {
          filter: { _id: response._id },
          update: { $set: setObject },
        },
      });
    }

    if (bulkOperations.length > 0) {
      //   console.log(JSON.stringify(bulkOperations, null, 2));
      const operationResult = await Responses.bulkWrite(bulkOperations, {
        ordered: false,
      });

      console.log("// operationResult:");
      console.log(operationResult);
    }
  }
};

addCreatedAtDate.args = ["surveyId", "editionId"];

addCreatedAtDate.description = `Add createdAtDate where missing.`;
