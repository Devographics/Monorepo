"use client";
import { FormSection } from "../form/FormSection";
import EditionMessage from "../surveys/SurveyMessage";
import type { ResponseDocument } from "@devographics/types";
import { useEdition } from "../SurveyContext/Provider";
import { useSection } from "../SectionContext/SectionProvider";

const SurveySectionContents = ({
  response,
  readOnly,
}: {
  response?: ResponseDocument;
  readOnly?: boolean;
}) => {
  const { edition } = useEdition();
  const sectionNumber = useSection();
  return (
    <div className="survey-section-wrapper">
      <EditionMessage edition={edition} />
      <FormSection
        sectionNumber={sectionNumber}
        response={response}
        edition={edition}
        readOnly={readOnly}
      />
    </div>
  );
};

export default SurveySectionContents;
