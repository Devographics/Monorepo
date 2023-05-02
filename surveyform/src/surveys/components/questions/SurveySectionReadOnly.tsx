import SurveySectionContents from "./SurveySectionContents";
import EditionMessage from "../SurveyMessage";
import { useEdition } from "../SurveyContext/Provider";
import { useSection } from "../SectionContext/SectionProvider";

const SurveySectionReadOnly = () => {
  const edition = useEdition();
  const sectionNumber = useSection();
  const sections = edition.sections;
  const sectionIndex = sectionNumber - 1;
  const section = sections[sectionIndex];
  const previousSection = sections[sectionIndex - 1];
  const nextSection = sections[sectionIndex + 1];
  const sectionProps = {
    sectionNumber,
    section,
    previousSection,
    nextSection,
  };
  return (
    <div className="survey-section-wrapper">
      <EditionMessage edition={edition} />
      <SurveySectionContents
        edition={edition}
        {...sectionProps}
        readOnly={true}
      />
    </div>
  );
};

export default SurveySectionReadOnly;
