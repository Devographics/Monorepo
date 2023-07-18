import {
  SurveyMetadata,
  EditionMetadata,
  LocaleDef,
  LocaleDefWithStrings,
  Entity,
} from "@devographics/types";

import { getFromCache, fetchGraphQLApi } from "@devographics/fetch";
import {
  editionMetadataCacheKey,
  surveysMetadataCacheKey,
  allLocalesMetadataCacheKey,
  localeCacheKey,
  allEntitiesCacheKey,
} from "./cache_keys";
import {
  getSurveysQuery,
  getEditionMetadataQuery,
  getAllLocalesMetadataQuery,
  getLocaleQuery,
  getEntitiesQuery,
} from "./queries";
import { publicConfig } from "~/config/public";
import { serverConfig } from "~/config/server";

interface FetcherFunctionOptions {
  // optionally indicate where this function was called from to help with logging
  calledFrom?: string;
  // function that returns a server config object
  serverConfig: Function;
}

/**
 * Load the metadata of a survey edition for the surveyform app
 * @returns
 */
export async function fetchEditionMetadata({
  surveyId,
  editionId,
  calledFrom,
  shouldThrow,
}: {
  surveyId: string;
  editionId: string;
  calledFrom?: string;
  shouldThrow?: boolean;
}) {
  if (!surveyId) {
    throw new Error(`surveyId not defined (calledFrom: ${calledFrom})`);
  }
  if (!editionId) {
    throw new Error(`editionId not defined (calledFrom: ${calledFrom})`);
  }
  const key = editionMetadataCacheKey({
    surveyId,
    editionId,
  });
  return await getFromCache<EditionMetadata>({
    key,
    fetchFunction: async () => {
      const result = await fetchGraphQLApi({
        query: getEditionMetadataQuery({ editionId }),
        key,
      });
      if (!result) {
        throw new Error(
          `Couldn't fetch survey ${editionId}, result: ${
            result && JSON.stringify(result)
          }`
        );
      }
      return result._metadata.surveys[0].editions[0];
    },
    calledFrom,
    serverConfig,
    shouldThrow,
  });
}

/**
 * Fetch metadata for all surveys
 * @returns
 */
export const fetchSurveysMetadata = async (options?: {
  calledFrom?: string;
  shouldThrow?: boolean;
}) => {
  const key = surveysMetadataCacheKey();
  const result = await getFromCache<Array<SurveyMetadata>>({
    key,
    fetchFunction: async () => {
      const result = await fetchGraphQLApi({ query: getSurveysQuery(), key });
      if (!result) throw new Error(`Couldn't fetch surveys`);
      return result._metadata.surveys;
    },
    calledFrom: options?.calledFrom,
    serverConfig,
    shouldThrow: options?.shouldThrow,
  });
  return result;
};

export const fetchSurveyMetadata = async ({
  surveyId,
}: {
  surveyId: string;
}) => {
  const allSurveys = await fetchSurveysMetadata();
  const survey = allSurveys.data.find((s) => s.id === surveyId);

  if (!survey) {
    throw new Error(`Couldn't fetch survey ${surveyId}`);
  }
  return survey;
};

/**
 * Fetch metadata for all locales
 * @returns
 */
export const fetchAllLocalesMetadata = async (options?: {
  shouldThrow?: boolean;
}) => {
  const key = allLocalesMetadataCacheKey();
  const result = await getFromCache<Array<LocaleDef>>({
    key,
    fetchFunction: async () => {
      const result = await fetchGraphQLApi({
        query: getAllLocalesMetadataQuery(),
        key,
      });
      return result.locales;
    },
    serverConfig,
    shouldThrow: options?.shouldThrow,
  });
  return result;
};

/**
 * Fetch metadata and strings for a specific locales
 * @returns
 */
export type FetchLocaleOptions = {
  localeId: string;
  contexts: string[];
  shouldThrow?: boolean;
};
export const fetchLocale = async ({
  localeId,
  contexts,
  shouldThrow,
}: FetchLocaleOptions) => {
  const key = localeCacheKey({ localeId, contexts });
  const result = await getFromCache<LocaleDefWithStrings>({
    key,
    fetchFunction: async () => {
      const result = await fetchGraphQLApi({
        query: getLocaleQuery({ localeId, contexts }),
        key,
      });
      if (!result) throw new Error(`Couldn't fetch locale ${localeId}`);
      const locale = result.locale;

      // react-i18n expects {foo1: bar1, foo2: bar2} etc. map whereas
      // api returns [{key: foo1, t: bar1}, {key: foo2, t: bar2}] etc. array
      const convertedStrings = {};
      locale.strings &&
        locale.strings.forEach(({ key, t, tHtml }) => {
          convertedStrings[key] = tHtml || t;
        });
      const convertedLocale = { ...locale, strings: convertedStrings };

      return convertedLocale as LocaleDefWithStrings;
    },
    serverConfig,
    shouldThrow,
  });
  return result;
};

export const fetchEntities = async (options?: { calledFrom?: string }) => {
  const key = allEntitiesCacheKey();
  return await getFromCache<Array<Entity>>({
    shouldGetFromCache: false,
    shouldUpdateCache: false,
    key,
    fetchFunction: async () => {
      const result = await fetchGraphQLApi({ query: getEntitiesQuery(), key });
      if (!result) throw new Error(`Couldn't fetch entities`);
      return result.entities as Entity[];
    },
    calledFrom: options?.calledFrom,
    serverConfig,
  });
};
