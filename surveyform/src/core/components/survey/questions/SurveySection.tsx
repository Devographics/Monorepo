import React from "react";
import SurveySectionContents from "./SurveySectionContents";
import SurveyHeadTags from "../SurveyHeadTags";
import SurveyMessage from "../SurveyMessage";
import { useSurveyResponseSectionParams } from "../hooks";
import { useSurvey } from "../SurveyContext/Provider";

const SurveySection = () => {
  let { responseId, sectionNumber = 1 } = useSurveyResponseSectionParams();
  const survey = useSurvey();
  // CODE to get the React components too:
  // import surveys from "~/surveys";
  //const survey = surveys.find(
  //  (s) =>
  //    s.prettySlug === surveyDefinition.slug &&
  //    s.year === Number(surveyDefinition.year)
  //);
  //if (!survey) throw new Error(`Survey with slug ${slug} not found`);

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
    <div className="survey-section-wrapper">
      <SurveyMessage survey={survey} />
      <SurveyHeadTags survey={survey} section={section} />
      <SurveySectionContents survey={survey} {...sectionProps} />
    </div>
  );
};

export default SurveySection;
