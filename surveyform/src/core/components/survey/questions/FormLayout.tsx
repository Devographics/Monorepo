import React from "react";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import SurveySectionHeading from "~/core/components/survey/questions/SurveySectionHeading";
import SurveyNav from "~/core/components/survey/questions/SurveyNav";

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
  } = props
  const FormComponents = useVulcanComponents();
  return (
    <div className="survey-section">
      <SurveyNav
        survey={survey}
        // response={response}
        navLoading={navLoading}
        setNavLoading={setNavLoading}
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
          <FormComponents.FormElement {...formProps}>
            {" "}
            {/* <FormComponents.FormSubmit {...submitProps} showMessage={false} variant="top"/> */}
            <FormComponents.FormErrors {...commonProps} {...errorProps} />
            {children}
            {repeatErrors && (
              <FormComponents.FormErrors {...commonProps} {...errorProps} />
            )}
            <FormComponents.FormSubmit
              {...commonProps}
              {...submitProps}
              variant="bottom"
            />
          </FormComponents.FormElement>
        </div>
      </div>
    </div>
  );
};

export default FormLayout;
