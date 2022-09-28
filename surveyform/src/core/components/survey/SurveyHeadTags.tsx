import { useIntlContext } from "@vulcanjs/react-i18n";
import React from "react";
import Head from "next/head";
import { computeHeadTags } from "./computeHeadTags";
import { publicConfig } from "~/config/public";

const SurveyHeadTags = ({ survey }) => {
  const { name, year, imageUrl } = survey;
  const intl = useIntlContext();
  return (
    <Head>
      {/** TODO: some props are probably missing but Vulcan components are not yet typed */}
      {computeHeadTags({
        title: `${name} ${year}`,
        description: intl.formatMessage(
          { id: "general.take_survey" },
          { name, year }
        ),
        imageUrl: `/surveys/${imageUrl}`,
        siteUrl: publicConfig.appUrl,
      })}
    </Head>
  );
};

export default SurveyHeadTags;
