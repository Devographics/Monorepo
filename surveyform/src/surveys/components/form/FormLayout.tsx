"use client";
import SurveySectionHeading from "~/surveys/components/questions/SurveySectionHeading";
import FormNav from "./FormNav";
import { FormErrors } from "./FormErrors";
import { FormElement } from "./FormElement";
import { FormSubmit } from "./FormSubmit";

const FormLayout = (props: any) => {
  const {
    children,
    response,
    section,
    sectionNumber,
    edition,
    navLoading,
    setNavLoading,
    readOnly,
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
          <FormElement>
            {children}
            <FormSubmit />
          </FormElement>
        </div>
      </div>
    </div>
  );
};

export default FormLayout;
