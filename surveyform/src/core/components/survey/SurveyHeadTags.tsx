"use client";
import { useIntlContext } from "@vulcanjs/react-i18n";
import React from "react";
import Head from "next/head";
import { computeHeadTags } from "./computeHeadTags";
import { publicConfig } from "~/config/public";
import { SurveyDocument, SurveySection } from "@devographics/core-models";
import { getSurveyImageUrl } from "~/surveys/getSurveyImageUrl";
import { getSectionKey, getSurveyTitle } from "~/modules/surveys/helpers";

const SurveyHeadTags = ({
  survey,
  section,
}: {
  survey: SurveyDocument;
  section?: SurveySection;
}) => {
  const { name, year, socialImageUrl, faviconUrl } = survey;
  const intl = useIntlContext();

  let finalImageUrl = socialImageUrl || getSurveyImageUrl(survey);

  const sectionTitle =
    section && intl.formatMessage({ id: getSectionKey(section) });
  const title = getSurveyTitle({ survey, sectionTitle });

  return (
    <Head>
      {/** TODO: some props are probably missing but Vulcan components are not yet typed */}
      {computeHeadTags({
        title,
        description: intl.formatMessage(
          { id: "general.take_survey" },
          { name, year }
        ),
        imageAbsoluteUrl: finalImageUrl,
        faviconUrl,
        siteUrl: publicConfig.appUrl,
      })}
    </Head>
  );
};

export default SurveyHeadTags;
