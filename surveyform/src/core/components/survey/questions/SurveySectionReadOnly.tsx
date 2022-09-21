import React from "react";
import SurveyNav from "./SurveyNav";
import SurveySectionContents from "./SurveySectionContents";
import { getSurvey } from "~/modules/surveys/getters";
import { useSurveyResponseParams } from "../hooks";

const SurveySectionReadOnly = () => {
  let {
    slug,
    year,
    sectionNumber = 0,
    paramsReady,
  } = useSurveyResponseParams();
  // FIXME: for some reason, paramsReady is true during SSR??
  if (!paramsReady) return null;

  const survey = getSurvey(slug, year);
  if (!survey)
    throw new Error(`Survey not found for slug ${slug} and year ${year}`);
  const surveyOutline = survey.outline;
  const section = surveyOutline[sectionNumber];
  const previousSection = surveyOutline[sectionNumber - 1];
  const nextSection = surveyOutline[sectionNumber + 1];
  const sectionProps = {
    sectionNumber,
    section,
    previousSection,
    nextSection,
  };
  return (
    <div className="survey-section">
      <SurveyNav
        survey={survey}
        // Not used yet
        //currentSectionNumber={sectionNumber}
        // Not used yet
        //readOnly={true}
      />
      <div className="section-contents">
        <SurveySectionContents
          survey={survey}
          {...sectionProps}
          readOnly={true}
        />
      </div>
    </div>
  );
};

export default SurveySectionReadOnly;
