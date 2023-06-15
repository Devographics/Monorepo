/**
 * Get locale from the translation API from the monorepo
 */
// cache for translation API request
// must be defined top-level to get the same cache for all requests
import { print } from "graphql/language/printer.js";
import gql from "graphql-tag";
import get from "lodash/get.js";
import fetch from "node-fetch";
import { serverConfig } from "~/config/server";
import { Locale, RawLocale } from "../typings";
import { getFragmentName } from "@vulcanjs/graphql";
import { nodeCache } from "~/lib/server/caching";

const disableAPICache = false; //getSetting("disableAPICache", false);
const translationAPI = serverConfig().translationAPI; //getSetting("translationAPI");

const localeDefinitionFragment = gql`
  fragment LocaleDefinition on Locale {
    id
    completion
    label
    translators
  }
`;
/**
 * Get the list of all locales from the API
 */
const localesQuery = print(gql`
  query Locales($contexts: [Contexts]) {
    locales(contexts: $contexts) {
      id
      completion
      label
      translators
    }
  }
`);

const localeStringsQuery = print(gql`
  query LocaleStrings($contexts: [Contexts], $localeId: String!) {
    locale(contexts:  $contexts, enableFallbacks: true, localeId: $localeId) {
      ...${getFragmentName(localeDefinitionFragment)}
      strings {
          key
          t
          context
          isFallback
      }
    }
  }
  ${localeDefinitionFragment}
`);

const commonContexts = ["common", "surveys", "accounts"];
const surveyContexts = [
  "state_of_css",
  "state_of_css_2021_survey",
  "state_of_js",
  "state_of_js_2020_survey",
  "state_of_js_2021_survey",
  "state_of_graphql",
];
// TODO: we should query only relevant strings per survey ideally
const contexts = [...commonContexts, ...surveyContexts];

const fetchTranslationApi = async (query: string, variables?: any) => {
  const response = await fetch(translationAPI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Translation API request failed with status ${response.status} and response.text(): ${body}`
    );
  }
  const json = (await response.json()) as { data?: any; errors?: any };
  // With Apollo Server, the response may contain an errors object
  if (json.errors) {
    console.error(json.errors);
    throw new Error(`Translation API query error ${json.errors}`);
  }
  return json;
};

// LOCALES LIST

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
const fetchLocales = async (variables?: { contexts?: Array<String> }) => {
  const json = await fetchTranslationApi(localesQuery, {
    contexts,
    ...(variables || {}),
  });
  const locales = get(json, "data.locales");
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
    console.error(err);
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
  const json = await fetchTranslationApi(localeStringsQuery, {
    contexts,
    /** Will use en-US strings if language is not yet covered, this is the default */
    enableFallbacks: true,
    ...variables,
  });
  const locale = get(json, "data.locale") as RawLocale | undefined | null;
  if (locale) {
    //console.debug("Got locale", locale.id);
    // Convert strings array to a map (and cache the result)
    const convertedLocaleCacheKey = ["convertedLocale", locale.id].join("/");
    let convertedLocale = nodeCache.get<Locale>(convertedLocaleCacheKey);
    if (convertedLocale) return convertedLocale;
    const convertedStrings = {};
    locale.strings &&
      locale.strings.forEach(({ key, t }) => {
        convertedStrings[key] = t;
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
  // Step 1: check that there is a locale for this id or try to find a close one
  // NOTE: normally this call costs nothing thanks to the cache system
  //const locales = await getLocales();
  //let existingLocaleId: string | undefined;
  /*
  if (!locales) {
    captureException(
      new Error(
        "Cannot get list of locales when fetching locale strings, can't verify if the locale exists."
      )
    );
  } else {
    existingLocaleId = findBestMatchingLocaleId(locales, localeId);
  }
  */

  /*
  if (!localeId) {
    captureException(
      `Trying to get strings for locale ${localeId}, but we don't have any translation for this locale or this country. Will fallback to en-US`
    );
   localeId = "en-US";
  }*/

  try {
    return await fetchLocaleStrings({ localeId });
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

// OLD DEPRECATED VERSION
// It will fetch all locales with all strings
// It was relevant when we had a server startup phase,
// but this is not the case anymore in a serverless logic

/**@deprecated */
const localePromiseWithStringsKey = "localesWithStringsPromise";
/**
 * Fetch locales in the distant translation API
 *
 * NOTE: it could use Apollo client instead of fetch
 * @returns
 *
 * @deprecated Will fetch all locales
 */
const fetchLocalesWithStrings = async () => {
  const response = await fetch(translationAPI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: localesWithStringsQuery,
      variables: { contexts },
    }),
  });
  const json: any = await response.json();

  if (json.errors) {
    console.log(json.errors);
    throw new Error("// locale API query error");
  }
  const locales = get(json, "data.locales");

  const convertedLocales = locales.map((locale) => {
    const convertedStrings = {};
    locale.strings &&
      locale.strings.forEach(({ key, t }) => {
        convertedStrings[key] = t;
      });
    const convertedLocale = { ...locale, strings: convertedStrings };
    return convertedLocale;
  });

  return convertedLocales;
};

/**
 * Fetch locales strings or get them from the node cache,
 * to avoid calling the translationAPI multiple times
 * @deprecated
 */
export const getLocalesWithStrings = async () => {
  //try {
  if (disableAPICache) {
    return await fetchLocalesWithStrings();
  }
  try {
    return await cachedPromise(
      promisesNodeCache,
      localePromiseWithStringsKey,
      LOCALES_TTL_SECONDS
    )(async () => await fetchLocalesWithStrings());
  } catch (err) {
    return undefined;
  }
  /*let localesPromise = nodeCache.get(localePromiseKey) as Promise<
      Array<{ id: string }>
    >;
    if (!localesPromise) {
      console.log("Cache miss, will try to fetch locales");
      //console.log("Cache miss for locales, will fetch translation API");
      // Don't forget to catch when creating the promise otherwise you still have an uncaught error
      const fetchLocalePromise = fetchLocales().catch(() => {});
      nodeCache.set(localePromiseKey, fetchLocalePromise, LOCALES_TTL_SECONDS);
      return await fetchLocalePromise;
    } else {
      //console.log("Found cached promise, no need to fetch locales, wait for it to resolve");
      // NOTE: if the promise is already resolved, it will simply return the resolved value
      console.log("Cache hit, wait for locales to be fetched");
      return await localesPromise;
    }
  } catch (err) {
    // empty the cache in case of error
    captureException(err);
    console.log("Promise failed, emptying the promise cache");
    nodeCache.del(localePromiseKey);
    return null;
  }*/
};

/**
 * @deprecated Get all locales from the API, with strings
 *
 * /!\ We should instead get strings locale per locale to avoid bloating the request
 */
const localesWithStringsQuery = print(gql`
  query LocaleQuery($contexts: [Contexts]) {
    locales(contexts: $contexts, enableFallbacks: true) {
      id
      completion
      label
      strings {
        key
        t
        context
        isFallback
      }
      translators
    }
  }
`);

/**
 * Get one locale from the locales list
 * @deprecated
 * @param localeId
 * @returns
 */
export const getLocaleWithStrings = async (localeId: string) => {
  const locales = await getLocalesWithStrings();
  if (!locales) return null;
  // If the region is matched, we respect it
  const exactLocale = locales.find(
    (l) => l.id.toLowerCase() === localeId.toLowerCase()
  );
  if (exactLocale) return exactLocale;
  // Else use a locale that is valid for this country
  const countryLocale = locales.find(
    (l) => l.id.slice(0, 2) === localeId.slice(0, 2)
  );
  return countryLocale || null;
};

/**
 * Get only one locale, with cache
 * @param localeId
 * @param origin
 * @returns
 */
export const getLocaleStringsCached = async (
  localeId: string,
  origin?: string
) => {
  const localeCacheKey = `locale[${localeId}]`;
  const localeWithStrings = nodeCache.get<ReturnType<any>>(localeCacheKey);
  if (localeWithStrings) {
    //console.info("Cache hit for locale", localeId)
    return localeWithStrings;
  }
  const res = await getLocaleWithStrings(localeId); //getLocaleStrings(localeId);

  //const localeWithStringsFromServer = resApollo?.data?.locale;
  nodeCache.set(localeCacheKey, res, 10 * 60);
  return res;
};
