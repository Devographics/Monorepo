import { cachedPromise, promisesNodeCache } from "~/lib/server/caching";
import { measureTime, getRedisClient } from "~/lib/server/utils";

export const getSurveyEditionEntitiesCacheKey = ({ surveyId }: { surveyId: string }) =>
    `entities_${surveyId}`

export const fetchEntitiesRedis = async (surveyId) => {
  const redisClient = await getRedisClient();
  const key = getSurveyEditionEntitiesCacheKey({ surveyId });
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
}

const ENTITIES_PROMISE_TTL_SECONDS = 10 * 60;

type EntitiesVariables = {
  surveyId: string
};

export const getOrFetchEntities = async (variables: EntitiesVariables) => {
  const { surveyId } = variables
  const cached = cachedPromise(
    promisesNodeCache,
    getSurveyEditionEntitiesCacheKey({ surveyId }),
    ENTITIES_PROMISE_TTL_SECONDS
  );
  const editionEntities = await cached(() => fetchEntitiesRedis(surveyId));
  return editionEntities
};
