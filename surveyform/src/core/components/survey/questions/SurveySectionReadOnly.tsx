import React from "react";
import SurveySectionContents from "./SurveySectionContents";
import { getSurvey } from "~/modules/surveys/getters";
import { useSurveyResponseParams } from "../hooks";
import { EntitiesProvider } from "~/core/components/common/EntitiesContext";
import SurveyHeadTags from "../SurveyHeadTags";
import SurveyMessage from "../SurveyMessage";

const SurveySectionReadOnly = () => {
  let {
    slug,
    year,
    sectionNumber = 1,
    paramsReady,
  } = useSurveyResponseParams();
  // FIXME: for some reason, paramsReady is true during SSR??
  if (!paramsReady) return null;

  const survey = getSurvey(slug, year);
  if (!survey)
    throw new Error(`Survey not found for slug ${slug} and year ${year}`);
  const surveyOutline = survey.outline;
  const sectionIndex = sectionNumber - 1;
  const section = surveyOutline[sectionIndex];
  const previousSection = surveyOutline[sectionIndex - 1];
  const nextSection = surveyOutline[sectionIndex + 1];
  const sectionProps = {
    sectionNumber,
    section,
    previousSection,
    nextSection,
  };
  return (
    <EntitiesProvider surveyId={survey.surveyId}>
      <div className="survey-section-wrapper">
        <SurveyMessage survey={survey} readOnly={true} />
        <SurveyHeadTags survey={survey} section={section} readOnly={true} />
        <SurveySectionContents
          survey={survey}
          {...sectionProps}
          readOnly={true}
        />
      </div>
    </EntitiesProvider>
  );
};

export default SurveySectionReadOnly;
