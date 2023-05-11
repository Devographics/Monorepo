"use client";
import SurveySectionHeading from "~/surveys/components/questions/SurveySectionHeading";
import FormNav from "./FormNav";
import { FormErrors } from "./FormErrors";
import { FormElement } from "./FormElement";
import { FormSubmit } from "./FormSubmit";

export const FormLayout = (props: any) => {
  const {
    children,
    response,
    section,
    sectionNumber,
    edition,
    navLoading,
    setNavLoading,
    readOnly,
    nextSection,
    previousSection,
  } = props;
  return (
    <div className="survey-section">
      <FormNav
        response={response}
        navLoading={navLoading}
        setNavLoading={setNavLoading}
        readOnly={readOnly}
        // Not actually used in SurveyNav
        //currentSectionNumber={sectionNumber}
      />
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
    </div>
  );
};

export default FormLayout;
