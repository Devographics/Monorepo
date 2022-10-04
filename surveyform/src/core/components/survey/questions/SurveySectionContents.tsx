import React, { useState } from "react";
//import { statuses } from "~/modules/constants.js";
import { FormItem } from "./FormItem";
import FormSubmit from "./FormSubmit";
import FormLayout from "./FormLayout";
//import FormLabel from "./FormLabel";
//import FormDescription from "./FormDescription";
import FormOptionLabel from "./FormOptionLabel";
//import { getSurveyPath } from "~/modules/surveys/helpers";
import { canModifyResponse } from "~/modules/responses/helpers";
import { useCreate } from "@vulcanjs/react-hooks";
import {
  //  SmartForm,
  useVulcanComponents,
  VulcanComponentsProvider,
} from "@vulcanjs/react-ui";
import { ResponsePerSurvey } from "~/modules/responses/model";
import { Save, SaveFragment } from "@devographics/core-models";
import type { ParsedQuestion, SurveyType } from "@devographics/core-models";
import { useUser } from "~/account/user/hooks";
import { EntitiesProvider } from "~/core/components/common/EntitiesContext";
import { defaultFormComponents } from "@vulcanjs/react-ui";
import { liteFormComponents } from "@vulcanjs/react-ui-lite";
import { bootstrapFormComponents } from "@vulcanjs/react-ui-bootstrap";
import SurveySectionHeading from "~/core/components/survey/questions/SurveySectionHeading";
import { SurveyResponseFragment } from "~/modules/responses/fragments";

const getEntityIds = (questions: Array<ParsedQuestion & { id: string }>) => {
  let ids: string[] = [];
  questions.forEach((question) => {
    const { id, options } = question;
    ids.push(id);
    if (options) {
      let optionsArray;
      if (typeof options === "function") {
        // TODO: options is a function of the props, that should contain a "data" field
        // Probably coming from an autocomplete
        // We can't handle that yet
        optionsArray = []; //options();
      } else {
        optionsArray = options;
      }
      optionsArray.forEach(({ id }) => {
        if (id) {
          ids.push(id);
        }
      });
    }
  });
  return ids;
};

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

  const FormSubmitWrapper = (props) => <FormSubmit {...props} {...formSubmitProps} />;

  const FormLayoutWrapper = (props) => <FormLayout {...props} {...formSubmitProps} />;

  return (
    /** Components rendered below this ComponentsProvider
     * can use the "Components.Form*" components
     */
    <VulcanComponentsProvider
      value={{
        ...defaultFormComponents,
        ...liteFormComponents,
        ...bootstrapFormComponents,
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
  const Components = useVulcanComponents();
  const { user } = useUser();

  const [createSave, { data, loading, error }] = useCreate({
    model: Save,
    fragment: SaveFragment,
  });

  const questions = section.questions.filter((q) => !q.hidden);
  const fields = questions.map((question) => question.fieldName);

  // we need to tell SmartForm to accept the comment fields as valid fields too
  for (const f of fields) {
    if (f.includes("__experience")) {
      fields.push(f.replace("__experience", "__comment"));
    }
  }

  const entityIds = getEntityIds(questions);

  const { id, intlId } = section;

  const trackSave = ({ lastSavedAt, isError = false }) => {
    const data = {
      startedAt: lastSavedAt,
      finishedAt: new Date(),
      responseId,
      isError,
    };
    createSave({ input: { data } });
  };

  const isLastSection = !nextSection;

  // const isDisabled = !canModifyResponse(response, user);

  return (
    <EntitiesProvider ids={entityIds}>
      <Components.SmartForm
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
        successCallback={(result) => {
          const { lastSavedAt } = result;
          trackSave({ lastSavedAt, isError: false });
        }}
        errorCallback={(document, error) => {
          if (document) {
            const { lastSavedAt } = document;
            trackSave({ lastSavedAt, isError: true });
          }
          console.error(error);
        }}
        warnUnsavedChanges={false}
        // disabled={isDisabled}
      />
    </EntitiesProvider>
  );
};

export default SurveySectionContents;
