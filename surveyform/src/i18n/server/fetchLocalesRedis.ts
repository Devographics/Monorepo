/**
 * Get locale from Redis
 * (Redis is filled via the api in monorepo)
 */
import { captureException } from "@sentry/nextjs";
import {
  cachedPromise,
  promisesNodeCache,
  nodeCache,
} from "~/lib/server/caching";
import { LocaleDef } from "../typings";
import { measureTime } from "~/lib/server/utils";
import { getRedisClient } from "~/lib/server/redis";

export const i18nCommonContexts = ["common", "surveys", "accounts"];
// TODO: move this elsewhere, maybe in surveys config?
// const surveyContexts = ["state_of_css", "state_of_js", "state_of_graphql"];
// TODO: we should query only relevant strings per survey ideally
//const contexts = [...i18nCommonContexts, ...surveyContexts];

// TODO: move to monorepo common code
export const getLocaleParsedContextCacheKey = ({
  localeId,
  context,
}: {
  localeId: string;
  /**
   * @example
   * surveys, common, accounts -> generic strings
   * state_of_js -> all strings for the survey
   * state_of_js_2022 -> specific year
   * results -> not used in surveyform
   */
  context: string;
}) => `locale_${localeId}_${context}_parsed`;
export const getAllLocalesMetadataCacheKey = () =>
  "locale_all_locales_metadata";

/*

Fetch a list of all locales, without strings

*/
const fetchAllLocalesRedis = async () => {
  const redisClient = getRedisClient();
  const key = getAllLocalesMetadataCacheKey();
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

/*

Fetch a single locale, with strings

*/
const fetchLocaleStringsRedis = async (variables: LocaleStringsVariables) => {
  const redisClient = await getRedisClient();
  const { localeId, contexts } = variables;
  const keyArray = (contexts || []).map((context) =>
    getLocaleParsedContextCacheKey({ ...variables, context })
  );
  const valueArray = await measureTime(async () => {
    return await redisClient.mget(keyArray);
  }, `fetchFromRedis ${localeId}: ${keyArray.join()}`);
  try {
    const stringFiles = valueArray.map(JSON.parse);
    let strings: any[] = [];
    stringFiles.forEach((stringFile, i) => {
      const context = keyArray[i];
      const stringsWithContext = stringFile.strings.map((s) => ({
        ...s,
        context,
      }));
      strings = [...strings, ...stringsWithContext];
    });
    const locale = {
      id: variables.localeId,
      strings,
    };
    return locale;
  } catch (error) {
    console.log("// JSON parsing error");
    console.log(valueArray);
  }
};

// LOCALES LIST

const localesPromiseKey = "localesPromise";
const LOCALES_TTL_SECONDS = 15 * 60; // 1 request per 15 minutes
/**
 * Fetch locales WITHOUT strings
 *
 * Will cache the promise to avoid concurrent requests, you can safely call this
 * function multiple times
 *
 * TODO: cache based on variables (especially the context)
 * @param variables
 * @returns
 */
const fetchLocales = async () => {
  const cached = cachedPromise(
    promisesNodeCache,
    localesPromiseKey,
    LOCALES_TTL_SECONDS
  );

  const locales = await cached(() => fetchAllLocalesRedis());

  if (locales) {
    return locales as Array<
      Pick<LocaleDef, "id" | "completion" | "label" | "translators">
    >;
  }
  return null;
};
/**
 * TODO: filter by context
 *
 * Cached via "fetchLocales"
 * @returns
 */
export const getLocales = async () => {
  try {
    return await fetchLocales();
  } catch (err) {
    captureException(err);
    return undefined;
  }
};

// ONE LOCALE WITH STRINGS

const localePromiseKey = (id: string) => ["localePromise", id].join("/");

interface LocaleStringsVariables {
  contexts: Array<string>;
  localeId: string;
}

/**
 * Will cache promise for each locale
 *
 * /!\ If a precise locale doesn't exist, will retrieve a close one
 *
 * @example "fr" will return "fr-FR" locale, because it's the closest matching one
 * Next.js will use the country locale if there is no region local
 * @example (full process) Next redirects fr-CA to fr, and we return fr-FR locale from server
 *
 * @param localeId
 * @returns
 */
export const fetchLocaleStrings = async (variables: LocaleStringsVariables) => {
  const label = `locales_${variables.localeId}_${variables.contexts}`
  console.time(label)
  //console.debug("Fetching locale", variables.localeId);
  const cached = cachedPromise(
    promisesNodeCache,
    localePromiseKey(variables.localeId),
    LOCALES_TTL_SECONDS
  );
  const queryVariables = {
    /** Will use en-US strings if language is not yet covered, this is the default */
    enableFallbacks: true,
    ...variables,
  };

  const locale = await cached(() => fetchLocaleStringsRedis(queryVariables));

  if (locale) {
    //console.debug("Got locale", locale.id);
    // Convert strings array to a map (and cache the result)
    const convertedLocaleCacheKey = ["convertedLocale", locale.id].join("/");
    let convertedLocale = nodeCache.get<LocaleDef>(convertedLocaleCacheKey);
    if (convertedLocale) return convertedLocale;
    const convertedStrings = {};
    locale.strings &&
      locale.strings.forEach(({ key, t, tHtml }) => {
        convertedStrings[key] = tHtml || t;
      });
    convertedLocale = { ...locale, strings: convertedStrings };
    nodeCache.set(
      convertedLocaleCacheKey,
      convertedLocale,
      LOCALES_TTL_SECONDS
    );
    console.timeEnd(label)
    return convertedLocale as LocaleDef;
    // return locale as Locale;
  }
  // locale not found
  console.timeEnd(label)
  return null;
};
