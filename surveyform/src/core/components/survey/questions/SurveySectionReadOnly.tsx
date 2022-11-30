import React from "react";
import SurveySectionContents from "./SurveySectionContents";
import { getSurvey } from "~/modules/surveys/getters";
import { useSurveyResponseParams } from "../hooks";
import SurveyHeadTags from "../SurveyHeadTags";
import SurveyMessage from "../SurveyMessage";

const SurveySectionReadOnly = () => {
  let { slug, year, sectionNumber = 1 } = useSurveyResponseParams();

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
    <div className="survey-section-wrapper">
      <SurveyMessage survey={survey} />
      <SurveyHeadTags survey={survey} section={section} />
      <SurveySectionContents
        survey={survey}
        {...sectionProps}
        readOnly={true}
      />
    </div>
  );
};

export default SurveySectionReadOnly;
