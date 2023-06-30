import {
  SurveyMetadata,
  EditionMetadata,
  LocaleDef,
  LocaleDefWithStrings,
} from "@devographics/types";

import { getFromCache, fetchGraphQLApi } from "@devographics/fetch";
import {
  editionMetadataCacheKey,
  surveysMetadataCacheKey,
  allLocalesMetadataCacheKey,
  localeCacheKey,
} from "./cache_keys";
import {
  getSurveysQuery,
  getEditionMetadataQuery,
  getAllLocalesMetadataQuery,
  getLocaleQuery,
  getAllLocalesIdsQuery,
} from "./queries";
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
}: {
  surveyId: string;
  editionId: string;
  calledFrom?: string;
}): Promise<EditionMetadata> {
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
        throw new Error(`Couldn't fetch survey ${editionId}, result: ${result && JSON.stringify(result)}`)
      }
      return result._metadata.surveys[0].editions[0];
    },
    calledFrom,
    serverConfig,
  });
}

/**
 * Fetch metadata for all surveys
 * @returns
 */
export const fetchSurveysMetadata = async (options?: {
  calledFrom?: string;
}): Promise<Array<SurveyMetadata>> => {
  const key = surveysMetadataCacheKey();
  return await getFromCache<Array<SurveyMetadata>>({
    key,
    fetchFunction: async () => {
      const result = await fetchGraphQLApi({ query: getSurveysQuery(), key });
      if (!result) throw new Error(`Couldn't fetch surveys`)
      return result._metadata.surveys as SurveyMetadata[];
    },
    calledFrom: options?.calledFrom,
    serverConfig,
  });
};

/**
 * Fetch metadata for all locales
 * @returns
 */
export const fetchAllLocalesMetadata = async (): Promise<Array<LocaleDef>> => {
  const key = allLocalesMetadataCacheKey();
  return await getFromCache<any>({
    key,
    fetchFunction: async () => {
      const result = await fetchGraphQLApi({
        query: getAllLocalesMetadataQuery(),
        key,
        apiUrl: serverConfig().translationAPI,
      });
      return result.locales;
    },
    serverConfig,
  });
};

/**
 * Fetch list of all available locale ids
 * Used for routing the user to the right locale
 * Safe for parallel calls (eg in Next.js middlewares)
 * @returns
 */
export const fetchAllLocalesIds = async (): Promise<Array<string>> => {
  const key = allLocalesMetadataCacheKey();
  return await getFromCache<any>({
    key,
    fetchFunction: async () => {
      const result = await fetchGraphQLApi<{ locales: Array<LocaleDef> }>({
        query: getAllLocalesIdsQuery(),
        key,
        apiUrl: serverConfig().translationAPI,
      });
      return result?.locales.map(l => l.id) || [];
    },
    serverConfig,
  });
}


/**
 * Fetch metadata and strings for a specific locales
 * @returns
 */
export type FetchLocaleOptions = {
  localeId: string;
  contexts: string[];
};
export const fetchLocale = async ({
  localeId,
  contexts,
}: FetchLocaleOptions): Promise<LocaleDefWithStrings> => {
  const key = localeCacheKey({ localeId, contexts });
  return await getFromCache<any>({
    key,
    fetchFunction: async () => {
      const result = await fetchGraphQLApi({
        query: getLocaleQuery({ localeId, contexts }),
        key,
        apiUrl: serverConfig().translationAPI,
      });
      if (!result) throw new Error(`Couldn't fetch locale ${localeId}`)
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
  });
};
