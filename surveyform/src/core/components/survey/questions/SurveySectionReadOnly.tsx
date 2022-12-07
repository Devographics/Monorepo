import React from "react";
import SurveySectionContents from "./SurveySectionContents";
import SurveyHeadTags from "../SurveyHeadTags";
import SurveyMessage from "../SurveyMessage";
import { useSurvey } from "../SurveyContext/Provider";
import { useSection } from "../SectionContext/SectionProvider";

const SurveySectionReadOnly = () => {
  const survey = useSurvey();
  const sectionNumber = useSection();
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
