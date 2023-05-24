"use client";
import SurveySectionHeading from "~/components/questions/SurveySectionHeading";
import FormNav from "./FormNav";
import { FormElement } from "./FormElement";
import { FormSubmit } from "./FormSubmit";
import { FormInputProps } from "./typings";
import { ReactNode } from "react";
import { SectionMetadata } from "@devographics/types";
import { FormError } from "./FormError";
import ReadingList from "../reading_list/ReadingList";

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
  } = props;
  return (
    <div className="survey-layout">
      <div className="survey-section">
        <FormNav {...props} />
        <div className="section-contents">
          <div className="section-questions" id="section-questions">
            <SurveySectionHeading
              section={section}
              sectionNumber={sectionNumber}
              edition={edition}
            />
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
        <div>
          <ReadingList {...props} />
        </div>
      </div>
      <FormError {...props} />
    </div>
  );
};

export default FormLayout;
