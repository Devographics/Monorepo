import React from "react";
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

const SurveySectionContents = ({
  survey,
  sectionNumber,
  section,
  response,
  previousSection,
  nextSection,
  readOnly,
}: {
  survey: SurveyType;
  sectionNumber?: number;
  section?: any;
  response?: any;
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
    if (f.includes('__experience')) {
      fields.push(f.replace('__experience', '__comment'))
    }
  }

  const entityIds = getEntityIds(questions);

  const { id, intlId } = section;

  const trackSave = ({ lastSavedAt, isError = false }) => {
    const data = {
      startedAt: lastSavedAt,
      finishedAt: new Date(),
      responseId: response._id,
      isError,
    };
    createSave({ input: { data } });
  };

  const FormSubmitWrapper = (props) => (
    <FormSubmit
      {...props}
      response={response}
      sectionNumber={sectionNumber}
      nextSection={nextSection}
      previousSection={previousSection}
      survey={survey}
      readOnly={readOnly}
    />
  );

  const isLastSection = !nextSection;

  const isDisabled = !canModifyResponse(response, user);
  return (
    <div className="section-questions" id="section-questions">
      <div className="section-heading">
        <h2 className="section-title">
          <span className="section-title-pagenumber">
            {sectionNumber}/{survey.outline.length}
          </span>
          <Components.FormattedMessage
            className="section-title-label"
            id={`sections.${intlId || id}.title`}
            defaultMessage={id}
            values={{ ...survey }}
          />
        </h2>
        <p className="section-description">
          <Components.FormattedMessage
            id={`sections.${intlId || id}.description`}
            defaultMessage={id}
            values={{ ...survey }}
          />
        </p>
      </div>
      <EntitiesProvider ids={entityIds}>
        <VulcanComponentsProvider
          value={{
            FormItem,
            FormLayout,
            FormSubmit: FormSubmitWrapper,
            FormOptionLabel,
            // TODO: the SmartForm do not allow to configure those 2 yet
            // FormLabel,
            // FormDescription,
          }}
        >
          <Components.SmartForm
            documentId={response && response._id}
            fields={fields}
            model={ResponsePerSurvey[survey.slug!]}
            // TODO: check those params in the smart form, they should accept DocumentNode and not only strings
            // + the name should be retrieved using getFragmentName from the DocumentNode fragment
            //queryFragment={ResponseFragment}
            //mutationFragment={ResponseFragment}
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
            disabled={isDisabled}
          />
        </VulcanComponentsProvider>
      </EntitiesProvider>
    </div>
  );
};

export default SurveySectionContents;
