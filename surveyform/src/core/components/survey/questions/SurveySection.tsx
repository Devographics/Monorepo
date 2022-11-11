import React from "react";
import SurveySectionContents from "./SurveySectionContents";
import SurveyHeadTags from "../SurveyHeadTags";
import SurveyMessage from "../SurveyMessage";
import { useSurveyResponseParams } from "../hooks";
import surveys from "~/surveys";
import { EntitiesProvider } from "~/core/components/common/EntitiesContext";
import { getEntityIdsFromSurvey } from "~/modules/entities/helpers";

const SurveySection = () => {
  let {
    responseId,
    sectionNumber = 1,
    slug,
    year,
    paramsReady,
  } = useSurveyResponseParams();
  // TODO: use a "SurveyContext" that is populated at layout level with the
  // current survey, and use "useCurrentSurvey"
  // This needs to wait for the incoming layout update of Next.js
  const survey = surveys.find(
    (s) => s.prettySlug === slug && s.year === Number(year)
  );

  if (!paramsReady) {
    return <div>Loading section…</div>;
  }

  if (!survey) throw new Error(`Survey with slug ${slug} not found`);

  const surveyOutline = survey.outline;
  const sectionIndex = sectionNumber - 1;
  const section = surveyOutline[sectionIndex];
  const previousSection = surveyOutline[sectionIndex - 1];
  const nextSection = surveyOutline[sectionIndex + 1];
  const sectionProps = {
    sectionNumber,
    section,
    // response,
    responseId,
    previousSection,
    nextSection,
  };

  return (
    <EntitiesProvider surveyId={survey.surveyId}>
      <div className="survey-section-wrapper">
        <SurveyMessage survey={survey} />
        <SurveyHeadTags survey={survey} section={section} />
        <SurveySectionContents survey={survey} {...sectionProps} />
      </div>
    </EntitiesProvider>
  );
};

export default SurveySection;
