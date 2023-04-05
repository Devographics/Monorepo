import SurveySectionContents from "./SurveySectionContents";
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
      <SurveySectionContents
        survey={survey}
        {...sectionProps}
        readOnly={true}
      />
    </div>
  );
};

export default SurveySectionReadOnly;
