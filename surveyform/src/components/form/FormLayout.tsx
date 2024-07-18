import SurveySectionHeading from "~/components/questions/SurveySectionHeading";
import FormNav from "./FormNav";
import { FormElement } from "./FormElement";
import { FormSubmit } from "./FormSubmit";
import { ReactNode } from "react";
import { SectionMetadata } from "@devographics/types";
import ReadingList from "../reading_list/ReadingList";
import FormSectionMessage from "./FormSectionMessage";

export interface FormLayoutProps {
  section: SectionMetadata;
  enableReadingList?: boolean;
  children: ReactNode;
  nextSection: SectionMetadata;
  previousSection: SectionMetadata;
}

export const FormLayout = (props: FormLayoutProps) => {
  const { children, section, nextSection, previousSection, enableReadingList } =
    props;

  return (
    <div className="survey-layout">
      <FormNav {...props} />

      <div className="survey-section">
        <SurveySectionHeading {...props} />

        <div className="section-contents">
          {section.messageId && <FormSectionMessage section={section} />}

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
    </div>
  );
};

export default FormLayout;
