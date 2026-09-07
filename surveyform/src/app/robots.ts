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
  // For each path, allow both the exact URL (`$`) and the same URL followed by
  // a query string (`?*`). In robots.txt the tested path includes the query
  // string, so a bare `$` rule would reject e.g. `?source=foobar`. Since `?` is
  // a literal here and a query always starts with it, this still blocks extra
  // path segments like `/xyz123` (session ids), which start with `/`, not `?`.
  const allowWithQuery = (path: string) => [`${path}$`, `${path}?*`];

  const allEditionsPaths = allEditions.flatMap(({ localeId, surveySlug, year }) =>
    allowWithQuery(`/${localeId}/survey/${surveySlug}/${year}`),
  );

  const indexPagePaths = locales.flatMap((locale) =>
    allowWithQuery(`/${locale.id}`),
  );

  const privacyPolicyPaths = locales.flatMap((locale) =>
    allowWithQuery(`/${locale.id}/privacy-policy`),
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
