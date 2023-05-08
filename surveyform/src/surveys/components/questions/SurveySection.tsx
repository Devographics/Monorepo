"use client";
import SurveySectionContents from "./SurveySectionContents";
import EditionMessage from "../SurveyMessage";
import { useSurveyResponseSectionParams } from "../hooks";
import { useEdition } from "../SurveyContext/Provider";

const SurveySection = () => {
  let { responseId, sectionNumber = 1 } = useSurveyResponseSectionParams();
  const { edition } = useEdition();

  const sections = edition.sections;
  const sectionIndex = sectionNumber - 1;
  const section = sections[sectionIndex];
  const previousSection = sections[sectionIndex - 1];
  const nextSection = sections[sectionIndex + 1];
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
      <EditionMessage edition={edition} />
      <SurveySectionContents edition={edition} {...sectionProps} />
    </div>
  );
};

export default SurveySection;
