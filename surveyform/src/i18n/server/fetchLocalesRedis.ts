/**
 * Get locale from the translation API from the monorepo
 */
// cache for translation API request
// must be defined top-level to get the same cache for all requests
import { captureException } from "@sentry/nextjs";
import { serverConfig } from "~/config/server";
import {
  cachedPromise,
  promisesNodeCache,
  nodeCache,
} from "~/lib/server/caching";
import { Locale } from "../typings";
import { createClient } from "redis";
import { measureTime } from "~/lib/server/utils";

const commonContexts = ["common", "surveys", "accounts"];
// TODO: move this elsewhere, maybe in surveys config?
const surveyContexts = ["state_of_css", "state_of_js", "state_of_graphql"];
// TODO: we should query only relevant strings per survey ideally
const contexts = [...commonContexts, ...surveyContexts];

// TODO: move to monorepo common code
export const getLocaleParsedContextCacheKey = ({
  localeId,
  context,
}: {
  localeId: string;
  context: string;
}) => `locale_${localeId}_${context}_parsed`;
export const getAllLocalesMetadataCacheKey = () =>
  "locale_all_locales_metadata";

// TODO: only do once
export const getRedisClient = async () => {
  const redisClient = createClient({
    url: process.env.REDIS_URL,
  });
  await redisClient.connect();
  return redisClient;
};

/*

Fetch a list of all locales, without strings

*/
const fetchAllLocalesRedis = async () => {
  const redisClient = await getRedisClient();
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
const fetchLocaleStringsRedis = async (variables) => {
  const redisClient = await getRedisClient();
  const { localeId, contexts } = variables;
  const keyArray = contexts.map((context) =>
    getLocaleParsedContextCacheKey({ ...variables, context })
  );
  const valueArray = await measureTime(async () => {
    return await redisClient.mGet(keyArray);
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
      Pick<Locale, "id" | "completion" | "label" | "translators">
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
/**
 * Will cache promise for each locale
 *
 * /!\ If a precise locale doesn't exist, will retrieve a close one
 *
 * @example "fr" will return "fr-FR" locale, because it's the closest matching one
 * Next.js will use the country locale if there is no region local
 * @example (full process) Next redirects fr-CA to fr, and we return fr-FR locale from server
 *
 * TODO: handle survey context
 * @param localeId
 * @returns
 */
const fetchLocaleStrings = async (variables: {
  contexts?: Array<string>;
  localeId: string;
}) => {
  //console.debug("Fetching locale", variables.localeId);
  const cached = cachedPromise(
    promisesNodeCache,
    localePromiseKey(variables.localeId),
    LOCALES_TTL_SECONDS
  );
  const queryVariables = {
    contexts,
    /** Will use en-US strings if language is not yet covered, this is the default */
    enableFallbacks: true,
    ...variables,
  };

  const locale = await cached(() => fetchLocaleStringsRedis(queryVariables));

  if (locale) {
    //console.debug("Got locale", locale.id);
    // Convert strings array to a map (and cache the result)
    const convertedLocaleCacheKey = ["convertedLocale", locale.id].join("/");
    let convertedLocale = nodeCache.get<Locale>(convertedLocaleCacheKey);
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
    return convertedLocale as Locale;
    // return locale as Locale;
  }
  // locale not found
  return null;
};

export const getLocaleStrings = async (localeId: string) => {
  try {
    return await fetchLocaleStrings({ localeId });
  } catch (err) {
    captureException(err);
    return undefined;
  }
};
