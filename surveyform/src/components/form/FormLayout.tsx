"use client";
import SurveySectionHeading from "~/components/questions/SurveySectionHeading";
import FormNav from "./FormNav";
import { FormElement } from "./FormElement";
import { FormSubmit } from "./FormSubmit";
import { FormInputProps } from "./typings";
import { ReactNode } from "react";
import { SectionMetadata } from "@devographics/types";
import ReadingList from "../reading_list/ReadingList";
import FormSectionMessage from "./FormSectionMessage";
import FormMessages from "./FormMessages";

interface FormLayoutProps extends FormInputProps {
  children: ReactNode;
  sectionNumber: number;
  nextSection: SectionMetadata;
  previousSection: SectionMetadata;
}

export const FormLayout = (props: FormLayoutProps) => {
  const {
    children,
    section,
    sectionNumber,
    edition,
    nextSection,
    previousSection,
    readOnly,
  } = props;

  const enableReadingList = !readOnly;

  return (
    <div className="survey-layout">
      {section.messageId && <FormSectionMessage section={section} />}
      <FormNav {...props} />

      <div className="survey-section">
        <SurveySectionHeading
          section={section}
          sectionNumber={sectionNumber}
          edition={edition}
        />
        <div className="section-contents">
          <div className="section-questions" id="section-questions">
            <FormElement {...props}>
              {children}
              <FormSubmit
                {...props}
                nextSection={nextSection}
                previousSection={previousSection}
              />
            </FormElement>
          </div>
        </div>
        <div className="section-sidebar">
          {enableReadingList && <ReadingList {...props} />}
        </div>
      </div>
      <FormMessages {...props} />
    </div>
  );
};

export default FormLayout;
