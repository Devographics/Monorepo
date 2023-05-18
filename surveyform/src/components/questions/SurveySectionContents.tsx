"use client";
import { SurveyStatusEnum } from "@devographics/types";
import { FormSection } from "../form/FormSection";
import EditionMessage from "../surveys/SurveyMessage";
import { ResponseDocument } from "@devographics/core-models";
import { useEdition } from "../SurveyContext/Provider";
import { useSection } from "../SectionContext/SectionProvider";

const SurveySectionContents = ({
  response,
  readOnly: readOnlyRoute,
}: {
  response?: ResponseDocument;
  readOnly?: boolean;
}) => {
  const { edition } = useEdition();

  const sectionNumber = useSection();
  const sections = edition.sections;
  const sectionIndex = sectionNumber - 1;
  const section = sections[sectionIndex];
  const previousSection = sections[sectionIndex - 1];
  const nextSection = sections[sectionIndex + 1];
  const isLastSection = !nextSection;

  const formProps = {
    sectionNumber,
    response,
    section,
    edition,
    readOnly: readOnlyRoute || edition.status === SurveyStatusEnum.CLOSED,
  };
  return (
    <div className="survey-section-wrapper">
      <EditionMessage edition={edition} />
      <FormSection {...formProps} />
    </div>
  );
};

export default SurveySectionContents;
