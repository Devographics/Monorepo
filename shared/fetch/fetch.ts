/**
 * 1) get from in-memory cache if available (short TTL because it can't be emptied)
 * 2) get from Redis if available (longer TTL, can be invalidated/updated easily)
 * 3) get from Github in last resort
 */
import NodeCache from "node-cache";
import {
    fetchJson,
    storeRedis,
    fetchEditionRedis,
    fetchSurveysListRedis,
    storeSurveyRedis,
    storeSurveysListRedis,
} from "@devographics/redis";
import orderBy from "lodash/orderBy.js";
import { SurveyMetadata, EditionMetadata } from "@devographics/types";
import {
    fetchEditionGraphQLSurveyForm,
    fetchSurveysListGraphQL,
} from "@devographics/graphql";

const SURVEY_FORM_CONTEXT = "surveyform";

const memoryCache = new NodeCache({
    // This TTL must stay short, because we manually invalidate this cache
    stdTTL: 5 * 60, // in seconds
    // needed for caching promises
    useClones: false,
});

async function getFromCache<T = any>(key: string, fetchFunc: () => Promise<T>) {
    if (memoryCache.has(key)) {
        console.debug(`🟢 [${key}] in-memory cache hit`);
        const res = await memoryCache.get<Promise<T>>(key)!;
        return res;
    } else {
        const redisData = await fetchJson<T>(key);
        if (redisData) {
            console.debug(`🔵 [${key}] in-memory cache miss, redis hit`);
            return redisData;
        } else {
            console.debug(
                `🟣 [${key}] in-memory & redis cache miss, fetching from API`
            );

            const promise = fetchFunc();
            memoryCache.set(key, promise);
            const result = await promise;

            // store in Redis in the background
            await storeRedis<T>(key, result);

            return result;
        }
    }
}

const editionMetadataKey = ({
    context,
    surveyId,
    editionId,
}: {
    context: string;
    surveyId: string;
    editionId: string;
}) => `${context}__${surveyId}__${editionId}__metadata`;

export async function fetchEditionMetadataSurveyForm({
    surveyId,
    editionId,
}: {
    surveyId: string;
    editionId: string;
}): Promise<EditionMetadata> {
    const key = editionMetadataKey({
        context: SURVEY_FORM_CONTEXT,
        surveyId,
        editionId,
    });
    return await getFromCache<EditionMetadata>(
        key,
        async () => await fetchEditionGraphQLSurveyForm({ surveyId, editionId })
    );
}

const surveysMetadataKey = ({ context }: { context: string }) =>
    `${context}__allSurveys__metadata`;

/**
 * When connecting to the dev API, will get the demo survey
 * @returns 
 */
export const fetchSurveysMetadata = async (): Promise<Array<SurveyMetadata>> => {
    const key = surveysMetadataKey({ context: SURVEY_FORM_CONTEXT });
    return await getFromCache<Array<SurveyMetadata>>(
        key,
        async () =>
            await fetchSurveysListGraphQL({ includeQuestions: false })
    );
};
