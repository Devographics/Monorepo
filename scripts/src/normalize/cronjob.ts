import { ResponseMongooseModel } from "~/modules/responses/model.server";
import { normalizeResponse } from "./normalize";

const limit = 800;

// every x min, normalize *limit* unnormalized responses
export const normalizeJob = async ({
  entities,
  rules,
}: {
  entities?: any;
  rules?: any;
}) => {
  const startAt = new Date();
  const unnormalizedResponses = await ResponseMongooseModel.find(
    {
      isNormalized: false,
    },
    null,
    { limit }
  );
  const responsesToNormalize = Math.min(unnormalizedResponses.length, limit);
  if (unnormalizedResponses.length === 0) {
    // eslint-disable-next-line
    console.log("// 📊 Found 0 unnormalized responses.");
    return;
  }
  // eslint-disable-next-line
  console.log(
    `// 📊 Normalizing ${responsesToNormalize}/${unnormalizedResponses.length} unnormalized responses at ${startAt}…`
  );
  unnormalizedResponses.forEach(async (response) => {
    await normalizeResponse({ document: response, entities, rules });
  });
  const endAt = new Date();
  const diff = Math.abs(endAt.valueOf() - startAt.valueOf());
  const duration = Math.ceil(diff / 1000);
  // eslint-disable-next-line
  console.log(
    `-> 📊 Done normalizing ${responsesToNormalize} responses in ${duration}s`
  );
};
