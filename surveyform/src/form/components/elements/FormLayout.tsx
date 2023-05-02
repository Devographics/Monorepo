"use client";
import SurveySectionHeading from "~/surveys/components/questions/SurveySectionHeading";
import SurveyNav from "~/surveys/components/questions/SurveyNav";
import { FormErrors } from "./FormErrors";
import { FormElement } from "./FormElement";
import { useVulcanComponents } from "@devographics/react-form";

const FormLayout = (props: any) => {
  const FormComponents = useVulcanComponents();
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
    edition,
    navLoading,
    setNavLoading,
    readOnly,
  } = props;
  return (
    <div className="survey-section">
      <SurveyNav
        edition={edition}
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
            edition={edition}
          />
          <FormElement {...formProps}>
            {" "}
            {/* <FormComponents.FormSubmit {...submitProps} showMessage={false} variant="top"/> */}
            <FormErrors {...commonProps} {...errorProps} />
            {children}
            {repeatErrors && <FormErrors {...commonProps} {...errorProps} />}
            {/**
             * TODO: we pass this component from SurveySectionContents to tune the props
             * Hence the context
             * There is probably  a cleaner way?
             */}
            <FormComponents.FormSubmit
              {...commonProps}
              {...submitProps}
              variant="bottom"
            />
          </FormElement>
        </div>
      </div>
    </div>
  );
};

export default FormLayout;
