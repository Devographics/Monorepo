import { useIntlContext } from "@vulcanjs/react-i18n";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import React from "react";
import Head from "next/head";
import { computeHeadTags } from "./computeHeadTags";

const SurveyHeadTags = ({ survey }) => {
  const { name, year, imageUrl } = survey;
  const Components = useVulcanComponents();
  const intl = useIntlContext();
  /* TODO: this doesn't work, Head children must be the tags directly. */
  const tags = (
    <Components.HeadTags
      title={`${name} ${year}`}
      description={intl.formatMessage(
        { id: "general.take_survey" },
        { name, year }
      )}
      image={`/surveys/${imageUrl}`}
    />
  );
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
        // TODO
        siteUrl: "http://todo-get-from-settings",
      })}
      {tags}
      <Components.HeadTags
        title={`${name} ${year}`}
        description={intl.formatMessage(
          { id: "general.take_survey" },
          { name, year }
        )}
        image={`/surveys/${imageUrl}`}
      />
    </Head>
  );
};

export default SurveyHeadTags;
