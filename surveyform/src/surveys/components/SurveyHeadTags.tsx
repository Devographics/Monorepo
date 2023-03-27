"use client";
import { useIntlContext } from "@devographics/react-i18n";
import Head from "next/head";
import { computeHeadTags } from "./computeHeadTags";
import { SurveyEdition, SurveySection } from "@devographics/core-models";
import { getSectionKey, getSurveyTitle } from "~/surveys/helpers";

// TODO: update to Next 13, we can compute that in "head.tsx"
const SurveyHeadTags = ({
  survey,
  section,
}: {
  survey: SurveyEdition;
  section?: SurveySection;
}) => {
  const { name, year } = survey;
  const intl = useIntlContext();
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
      })}
    </Head>
  );
};

export default SurveyHeadTags;
