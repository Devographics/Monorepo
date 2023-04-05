import { SurveyEdition } from "@devographics/core-models";
import { getRedisClient } from "@devographics/core-models/server";
import { cachedPromise, promisesNodeCache } from "~/lib/server/caching";
import { measureTime } from "~/lib/server/utils";

export const getEntitiesCacheKey = () => `entities_all`;

export const getSurveyEditionEntitiesCacheKey = ({
  surveyId,
}: {
  surveyId: string;
}) => `entities_${surveyId}`;

export const fetchEntitiesRedis = async (editionId: SurveyEdition["editionId"]) => {
  const redisClient = getRedisClient();
  const key = getSurveyEditionEntitiesCacheKey({ surveyId: editionId });
  const value = await measureTime(async () => {
    return await redisClient.get(key);
  }, `fetchFromRedis ${key}`);
  try {
    const json = JSON.parse(value);
    return json;
  } catch (error) {
    console.log("// JSON parsing error");
    console.log(value);
  }
};

const ENTITIES_PROMISE_TTL_SECONDS = 10 * 60;

type EntitiesVariables = {
  surveyId: SurveyEdition["editionId"]
};

export const getOrFetchEntities = async (variables: EntitiesVariables) => {
  const { surveyId } = variables;
  const cached = cachedPromise(
    promisesNodeCache,
    surveyId
      ? getSurveyEditionEntitiesCacheKey({ surveyId })
      : getEntitiesCacheKey(),
    ENTITIES_PROMISE_TTL_SECONDS
  );
  const editionEntities = await cached(() => fetchEntitiesRedis(surveyId));
  return editionEntities;
};
