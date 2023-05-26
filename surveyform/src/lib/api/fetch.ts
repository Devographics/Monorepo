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
} from "./queries";

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
  return await getFromCache<EditionMetadata>(
    key,
    async () => {
      const result = await fetchGraphQLApi({
        query: getEditionMetadataQuery({ editionId }),
        key,
      });
      return result._metadata.surveys[0].editions[0];
    },
    calledFrom
  );
}

/**
 * Fetch metadata for all surveys
 * @returns
 */
export const fetchSurveysMetadata = async (options?: {
  calledFrom?: string;
}): Promise<Array<SurveyMetadata>> => {
  const key = surveysMetadataCacheKey();
  return await getFromCache<Array<SurveyMetadata>>(
    key,
    async () => {
      const result = await fetchGraphQLApi({ query: getSurveysQuery(), key });
      return result._metadata.surveys as SurveyMetadata[];
    },
    options?.calledFrom
  );
};

/**
 * Fetch metadata for all locales
 * @returns
 */
export const fetchAllLocalesMetadata = async (): Promise<Array<LocaleDef>> => {
  const key = allLocalesMetadataCacheKey();
  return await getFromCache<any>(key, async () => {
    const result = await fetchGraphQLApi({
      query: getAllLocalesMetadataQuery(),
      key,
      apiUrl: process.env.INTERNAL_API_URL,
    });
    return result.locales;
  });
};

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
  return await getFromCache<any>(key, async () => {
    const result = await fetchGraphQLApi({
      query: getLocaleQuery({ localeId, contexts }),
      key,
      apiUrl: process.env.INTERNAL_API_URL,
    });
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
  });
};
