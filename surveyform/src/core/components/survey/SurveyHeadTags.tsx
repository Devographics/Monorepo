import { useIntlContext } from "@vulcanjs/react-i18n";
import React from "react";
import Head from "next/head";
import { computeHeadTags } from "./computeHeadTags";
import { publicConfig } from "~/config/public";
import { SurveyDocument } from "@devographics/core-models";
import { isAbsoluteUrl } from "~/core/utils/isAbsoluteUrl";
import { getSurveyImageUrl } from "~/surveys/getSurveyImageUrl";

const SurveyHeadTags = ({ survey }: { survey: SurveyDocument }) => {
  const { name, year, socialImageUrl, faviconUrl } = survey;
  const intl = useIntlContext();

  let finalImageUrl = socialImageUrl || getSurveyImageUrl(survey);

  return (
    <Head>
      {/** TODO: some props are probably missing but Vulcan components are not yet typed */}
      {computeHeadTags({
        title: `${name} ${year}`,
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
