import SurveySectionContents from "./SurveySectionContents";
import EditionMessage from "../SurveyMessage";
import { EditionMetadata } from "@devographics/types";

const SurveySection = ({
  responseId,
  sectionNumber,
  edition,
}: {
  responseId: string;
  sectionNumber: number;
  edition: EditionMetadata;
}) => {
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
      <SurveySectionContents {...sectionProps} edition={edition} />
    </div>
  );
};

export default SurveySection;
