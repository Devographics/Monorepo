import { MetadataRoute } from "next";
import { serverConfig } from "~/config/server";
import { rscAllLocalesMetadata } from "~/lib/i18n/api/rsc-fetchers";
import { getSurveySlug } from "~/lib/surveys/data";
import { rscFetchSurveysMetadata } from "~/lib/surveys/rsc-fetchers";

const host = serverConfig().appUrl;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const surveysResult = await rscFetchSurveysMetadata({ shouldThrow: false });
  const surveys = surveysResult.data;

  const localesResult = await rscAllLocalesMetadata();
  const locales = localesResult.data;

  const allEditions = locales
    .map((locale) => {
      return surveys.map((survey) => {
        return survey.editions.map((edition) => ({
          surveyId: survey.id,
          surveySlug: getSurveySlug(survey.id),
          year: edition.year,
          localeId: locale.id,
        }));
      });
    })
    .flat()
    .flat();
  const allEditionsPaths = allEditions.map(
    ({ localeId, surveySlug, year }) => `/${localeId}/${surveySlug}/${year}$`
  );

  const indexPagePaths = locales.map((locale) => `/${locale.id}$`);

  const privacyPolicyPaths = locales.map(
    (locale) => `/${locale.id}/privacy-policy$`
  );

  const allowPaths = [
    ...privacyPolicyPaths,
    ...allEditionsPaths,
    ...indexPagePaths,
  ];

  return {
    rules: {
      userAgent: "*",
      disallow: ["/"],
      allow: allowPaths,
    },
    host,
  };
}
