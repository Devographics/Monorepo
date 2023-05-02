import SurveySectionContents from "./SurveySectionContents";
import EditionMessage from "../SurveyMessage";
import { useSurveyResponseSectionParams } from "../hooks";
import { useSurvey } from "../SurveyContext/Provider";

const SurveySection = () => {
  let { responseId, sectionNumber = 1 } = useSurveyResponseSectionParams();
  const survey = useSurvey();

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
      <EditionMessage survey={survey} />
      <SurveySectionContents survey={survey} {...sectionProps} />
    </div>
  );
};

export default SurveySection;
