import React from "react";
import SurveySectionHeading from "~/core/components/survey/questions/SurveySectionHeading";
import SurveyNav from "~/core/components/survey/questions/SurveyNav";
import FormSubmit from "./FormSubmit";
import { FormErrors } from "./FormErrors";
import { FormElement } from "./FormElement";

const FormLayout = (props: any) => {
  const {
    commonProps,
    formProps,
    errorProps,
    repeatErrors,
    submitProps,
    children,
    // response,
    section,
    sectionNumber,
    survey,
    navLoading,
    setNavLoading,
    readOnly,
  } = props;
  return (
    <div className="survey-section">
      <SurveyNav
        survey={survey}
        // response={response}
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
            survey={survey}
          />
          <FormElement {...formProps}>
            {" "}
            {/* <FormComponents.FormSubmit {...submitProps} showMessage={false} variant="top"/> */}
            <FormErrors {...commonProps} {...errorProps} />
            {children}
            {repeatErrors && <FormErrors {...commonProps} {...errorProps} />}
            <FormSubmit {...commonProps} {...submitProps} variant="bottom" />
          </FormElement>
        </div>
      </div>
    </div>
  );
};

export default FormLayout;
