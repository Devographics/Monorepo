import { cache } from "react";
import {
  fetchSurveysMetadata,
  FetcherFunctionOptions,
} from "@devographics/fetch";
import type { Metadata } from "next";
import { publicConfig } from "~/config/public";
import { rscMustGetSurveyEditionFromUrl } from "~/app/[lang]/survey/[slug]/[year]/rsc-fetchers";
import { getCommonContexts, getEditionContexts } from "~/lib/i18n/config";
import { getEditionTitle } from "~/lib/surveys/helpers/getEditionTitle";
import { getEditionImageUrl } from "~/lib/surveys/helpers/getEditionImageUrl";
import { getSectionTokens } from "~/lib/i18n/survey";
import { serverConfig } from "~/config/server";
import { rscTeapot } from "~/lib/i18n/components/ServerT";

const MIN_YEAR = 2020;

export const rscFetchSurveysMetadata = cache(
  async (options?: FetcherFunctionOptions) => {
    const result = await fetchSurveysMetadata({
      ...options,
      calledFrom: __filename,
      getServerConfig: serverConfig,
    });
    result.data = result.data?.map((survey) => ({
      ...survey,
      editions: survey?.editions
        // remove older editions that don't have an API context anymore
        ?.filter(e => e.year >= MIN_YEAR)
        // remove survey editions with no questions
        ?.filter(
          (edition) => edition?.sections?.length > 0
        )
    }));

    return result;
  }
);

/**
 * TODO: this is actually used by "generateMetadata" functions
 * => is it ok to use "rsc" functions here? Not sure, we should call the underlying functions probably
 * as there is no nesting here
 */
export const rscGetMetadata = async ({
  params,
}: {
  params: { lang: string; sectionNumber?: string; slug: string; year: string };
}) => {
  // Important : this allow nested server-side method to know the current language
  // setLocaleIdServerContext(params.lang)
  const { lang, sectionNumber } = params;
  const { data: edition } = await rscMustGetSurveyEditionFromUrl(params);

  const contexts = getEditionContexts(edition, true);

  const { t, error } = await rscTeapot({ contexts, localeId: params.lang });
  if (error)
    throw new Error(
      "Could not access translation function:" + JSON.stringify(error)
    );

  const { socialImageUrl, year } = edition;
  const { name = "" } = edition.survey;

  const imageUrl = getEditionImageUrl(edition, "og");
  let imageAbsoluteUrl = socialImageUrl || imageUrl;
  const url = edition.questionsUrl || publicConfig.appUrl;
  const description = t("general.take_survey", { name, year: year + "" });

  let title = getEditionTitle({ edition });

  const section =
    sectionNumber && edition.sections?.[parseInt(sectionNumber) - 1];

  if (section) {
    const { title: sectionTitleId } = getSectionTokens({ section });
    const sectionTitle = t(sectionTitleId);
    title += `: ${sectionTitle}`;
  }

  const meta: Metadata = {
    title,
    description,
    // NOTE: merge between route segments is shallow, you may need to repeat field from layout
    openGraph: {
      title,
      description,
      siteName: title,
      // @ts-ignore
      type: "article" as const,
      url,
      images: imageAbsoluteUrl,
    },
    twitter: {
      // @ts-ignore
      card: "summary" as const,
      images: imageAbsoluteUrl,
    },
    alternates: {
      canonical: url,
      // we could create alternates for languages too
    },
  };

  return meta;
};
