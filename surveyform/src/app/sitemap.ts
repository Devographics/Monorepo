import { fetchSurveysMetadata } from "@devographics/fetch";
import { MetadataRoute } from "next";
import { serverConfig } from "~/config/server";
import { getEditionHomePath } from "~/lib/surveys/helpers";

// https://survey.devographics.com
const host = serverConfig().appUrl;

export const maxDuration = 180; // This function can run for a maximum of 180 seconds

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const surveysRes = await fetchSurveysMetadata();
  const surveys = surveysRes.data || [];
  if (surveysRes.error) {
    console.warn(
      "Couldn't generate sitemap for all surveys, error while fetching:",
      surveysRes.error
    );
  }
  const surveyHomes = surveys
    .map((survey) => {
      return survey.editions.map((edition) => {
        const route = {
          url: host + getEditionHomePath({ edition, locale: { id: "en-US" } }),
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 1,
        };
        return route;
      });
    })
    .flat(1) as MetadataRoute.Sitemap;
  return [
    {
      url: host + "/",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...surveyHomes,
  ];
}
