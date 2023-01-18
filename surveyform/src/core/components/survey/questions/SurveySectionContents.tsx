"use client";
import { Provider as UrqlProvider } from "urql";
import { createClient } from "@urql/core";
import React, { useState } from "react";
import { FormItem } from "./FormItem";
import FormSubmit from "./FormSubmit";
import FormLayout from "./FormLayout";
import FormOptionLabel from "./FormOptionLabel";
import {
  Form,
  MutationButton,
  SmartForm,
  VulcanComponentsProvider,
} from "@devographics/react-form";
import { ResponsePerSurvey } from "~/modules/responses/model";
import type { SurveyType } from "@devographics/core-models";
import { SurveyResponseFragment } from "~/modules/responses/fragments";
import { getCommentFieldName } from "~/modules/surveys/helpers";
import { Button } from "../../ui/Button";
import { LoadingButton } from "../../ui/LoadingButton";
import { TooltipTrigger } from "../../ui/TooltipTrigger";
import { getAppGraphqlUri } from "~/lib/graphql";
import { Loading } from "../../ui/Loading";

const crossDomainGraphqlUri =
  !!process.env.NEXT_PUBLIC_CROSS_DOMAIN_GRAPHQL_URI || false;
// @see packages/@vulcanjs/next-apollo/apolloClient.ts if more options are needed
// eg for auth
const urqlClient = createClient({
  url: getAppGraphqlUri(),
  fetchOptions: {
    credentials: crossDomainGraphqlUri ? "include" : "same-origin",
  },
});

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
    <UrqlProvider value={urqlClient}>
      <VulcanComponentsProvider
        value={{
          // needed by MutationButton
          Button: Button,
          LoadingButton: LoadingButton,
          TooltipTrigger: TooltipTrigger,
          // MutationButton
          MutationButton: MutationButton,
          // needed by FormContainer
          Loading: Loading,
          Form: Form,
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
    </UrqlProvider>
  );
};

const SurveySectionContentsInner = ({
  survey,
  sectionNumber,
  section,
  responseId,
  previousSection,
  nextSection,
  readOnly,
}: {
  survey: SurveyType;
  sectionNumber?: number;
  section?: any;
  responseId?: string;
  previousSection?: any;
  nextSection?: any;
  readOnly?: boolean;
}) => {
  const questions = section.questions.filter((q) => !q.hidden);
  const fields = questions.map((question) => question.fieldName);

  // we need to tell SmartForm to accept the comment fields as valid fields too
  for (const f of fields) {
    if (f.includes("__experience")) {
      fields.push(getCommentFieldName(f));
    }
  }

  const isLastSection = !nextSection;

  return (
    <SmartForm
      documentId={responseId}
      fields={fields}
      model={ResponsePerSurvey[survey.slug!]}
      // TODO: check those params in the smart form, they should accept DocumentNode and not only strings
      // + the name should be retrieved using getFragmentName from the DocumentNode fragment
      queryFragment={SurveyResponseFragment(survey)}
      mutationFragment={SurveyResponseFragment(survey)}
      //queryFragmentName="ResponseFragment"
      //mutationFragmentName="ResponseFragment"
      /*
          Instead, we use the context to pass new components
          However, we could reenable this prop as well for more flexbility
        components={{
          FormItem,
          FormLayout,
          FormSubmit: FormSubmitWrapper,
          FormOptionLabel,
          FormLabel,
          FormDescription,
        }}*/
      // TODO: not all those props are correctly handled by the SmartForm
      showDelete={false}
      itemProperties={{
        layout: "vertical",
      }}
      submitCallback={(data) => {
        data.lastSavedAt = new Date();
        if (isLastSection) {
          data.isFinished = true;
        }
        return data;
      }}
      // successCallback={(result) => {
      //   const { lastSavedAt } = result;
      //   trackSave({ lastSavedAt, isError: false });
      // }}
      // errorCallback={(document, error) => {
      //   if (document) {
      //     const { lastSavedAt } = document;
      //     trackSave({ lastSavedAt, isError: true });
      //   }
      //   console.error(error);
      // }}
      warnUnsavedChanges={false}
      disabled={readOnly}
    />
  );
};

export default SurveySectionContents;
