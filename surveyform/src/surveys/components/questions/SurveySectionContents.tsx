"use client";
import { useState } from "react";
// TODO: let the FormContainer directly get those components
import { FormItem } from "~/form/components/elements/FormItem";
import FormSubmit from "~/form/components/elements/FormSubmit";
import FormLayout from "~/form/components/elements/FormLayout";
import FormOptionLabel from "~/form/components/elements/FormOptionLabel";
import FormGroup from "~/form/components/elements/FormGroup";
import { Form, VulcanComponentsProvider } from "@devographics/react-form";
import { getSurveyResponseModel } from "~/responses/model.client";
import type { SurveyEdition } from "@devographics/core-models";
import { SurveyResponseFragment } from "~/responses/fragments";
import { Button } from "~/core/components/ui/Button";
import { LoadingButton } from "~/core/components/ui/LoadingButton";
import { TooltipTrigger } from "~/core/components/ui/TooltipTrigger";
import { Loading } from "~/core/components/ui/Loading";
import { SmartForm } from "~/form/components/smartform/FormContainer";
import { EditionMetadata } from "@devographics/types";
import { useUserResponse } from "~/responses/hooks";
import { FormSection } from "../form/FormSection";

const SurveySectionContents = (props) => {
  const [prevLoading, setPrevLoading] = useState(false);
  const [nextLoading, setNextLoading] = useState(false);
  const [navLoading, setNavLoading] = useState(false);

  const loadingProps = {
    prevLoading,
    setPrevLoading,
    nextLoading,
    setNextLoading,
    navLoading,
    setNavLoading,
  };

  const formSubmitProps = {
    ...props,
    ...loadingProps,
  };

  const FormSubmitWrapper = (props) => (
    <FormSubmit {...props} {...formSubmitProps} />
  );

  const FormLayoutWrapper = (props) => (
    <FormLayout {...props} {...formSubmitProps} />
  );

  return (
    /** Components rendered below this ComponentsProvider * can use the
      "Components.Form*" components + URQL hooks*/
    // TODO: move this setup in FormContainer directly
    <VulcanComponentsProvider
      value={{
        Button: Button,
        LoadingButton: LoadingButton,
        TooltipTrigger: TooltipTrigger,
        // needed by FormContainer
        Loading: Loading,
        Form: Form,
        // needed by Form
        FormGroup: FormGroup,
        // Needed by FormComponent
        // Form items
        FormItem,
        FormLayout: FormLayoutWrapper,
        FormSubmit: FormSubmitWrapper,
        FormOptionLabel,
        // TODO: the SmartForm do not allow to configure those 2 yet
        // FormLabel,
        // FormDescription,
      }}
    >
      <SurveySectionContentsInner {...props} {...loadingProps} />
    </VulcanComponentsProvider>
  );
};

const SurveySectionContentsInner = ({
  edition,
  sectionNumber,
  section,
  responseId,
  previousSection,
  nextSection,
  readOnly,
}: {
  edition: EditionMetadata;
  sectionNumber?: number;
  section?: any;
  responseId?: string;
  previousSection?: any;
  nextSection?: any;
  readOnly?: boolean;
}) => {
  const {
    response,
    loading: responseLoading,
    error: responseError,
  } = useUserResponse({
    editionId: edition.id,
    surveyId: edition.survey.id,
  });

  if (responseLoading) {
    return <Loading />;
  }

  const questions = section.questions.filter((q) => !q.hidden);
  const fields = questions.map((question) => question?.formPaths?.response);

  // we need to tell SmartForm to accept the comment fields as valid fields too
  for (const f of section.questions) {
    if (f?.formPaths?.comment) {
      fields.push(f.formPaths.comment);
    }
  }

  const isLastSection = !nextSection;

  const formProps = {
    sectionNumber,
    response,
    section,
    edition,
  };
  return <FormSection {...formProps} />;
  // return (
  //   <SmartForm
  //     documentId={responseId}
  //     document={response}
  //     fields={fields}
  //     model={getSurveyResponseModel(edition)}
  //     // TODO: check those params in the smart form, they should accept DocumentNode and not only strings
  //     // + the name should be retrieved using getFragmentName from the DocumentNode fragment
  //     queryFragment={SurveyResponseFragment(edition)}
  //     mutationFragment={SurveyResponseFragment(edition)}
  //     // TODO: not all those props are correctly handled by the SmartForm
  //     showDelete={false}
  //     itemProperties={{
  //       layout: "vertical",
  //     }}
  //     submitCallback={(data) => {
  //       data.lastSavedAt = new Date();
  //       if (isLastSection) {
  //         data.isFinished = true;
  //       }
  //       return data;
  //     }}
  //     // successCallback={(result) => {
  //     //   const { lastSavedAt } = result;
  //     //   trackSave({ lastSavedAt, isError: false });
  //     // }}
  //     // errorCallback={(document, error) => {
  //     //   if (document) {
  //     //     const { lastSavedAt } = document;
  //     //     trackSave({ lastSavedAt, isError: true });
  //     //   }
  //     //   console.error(error);
  //     // }}
  //     warnUnsavedChanges={false}
  //     disabled={readOnly}
  //   />
  // );
};

export default SurveySectionContents;
