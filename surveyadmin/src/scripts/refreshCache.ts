import {
  fetchAllLocalesMetadata,
  fetchEditionMetadata,
  fetchLocale,
  fetchSurveysMetadata,
} from "@devographics/fetch";
import { FetcherFunctionOptions } from "@devographics/fetch/types";
import { AppName, EditionMetadata } from "@devographics/types";

export const refreshCache = async (args) => {
  const { key } = args;
  return { key };
};

export const refreshSurveysCache = async (args) => {
  const { target } = args;
  const refreshedCacheKeys: string[] = [];
  // get list of all surveys
  console.log("// Refreshing all surveys metadata cache…");
  const options: FetcherFunctionOptions = {
    appName: AppName.SURVEYFORM,
    shouldUpdateCache: true,
    shouldGetFromCache: false,
  };
  const { data: allSurveys, cacheKey } = await fetchSurveysMetadata(options);
  refreshedCacheKeys.push(cacheKey!);

  for (const survey of allSurveys) {
    for (const edition of survey.editions) {
      console.log(`// Refreshing ${edition.id} metadata cache…`);

      const { cacheKey } = await fetchEditionMetadata({
        ...options,
        surveyId: survey.id,
        editionId: edition.id,
      });
      refreshedCacheKeys.push(cacheKey!);
    }
  }
  return { refreshedCacheKeys };
};

// i18n contexts common to all surveys and editions
export const getCommonContexts = () => ["common", "surveys", "accounts"];

export const refreshLocalesCache = async (args) => {
  const { target } = args;
  const { data: allSurveys } = await fetchSurveysMetadata();

  const refreshedCacheKeys: string[] = [];
  // get list of all locales
  console.log("// Refreshing all locales metadata cache…");
  const options: FetcherFunctionOptions = {
    appName: AppName.SURVEYFORM,
    shouldUpdateCache: true,
    shouldGetFromCache: false,
  };
  const { data: allLocales, cacheKey } = await fetchAllLocalesMetadata(options);
  refreshedCacheKeys.push(cacheKey!);

  for (const locale of allLocales) {
    // common contexts
    console.log(
      `// Refreshing ${locale.id} metadata cache… (${getCommonContexts().join(
        ", "
      )})`
    );
    const { cacheKey } = await fetchLocale({
      ...options,
      localeId: locale.id,
      contexts: getCommonContexts(),
    });
    refreshedCacheKeys.push(cacheKey!);

    // survey-specific context
    for (const survey of allSurveys) {
      console.log(`// Refreshing ${locale.id} metadata cache… (${survey.id})`);
      const { cacheKey } = await fetchLocale({
        ...options,
        localeId: locale.id,
        contexts: [survey.id],
      });
      refreshedCacheKeys.push(cacheKey!);
    }
  }

  return { refreshedCacheKeys };
};
