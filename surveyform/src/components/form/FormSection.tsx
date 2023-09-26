"use client";
import FormLayout from "./FormLayout";
import FormQuestion from "./FormQuestion";
import { ErrorBoundary } from "~/components/error";
import { EditionMetadata, ResponseDocument } from "@devographics/types";
import { FormStateContextProvider } from "./FormStateContext";
import { FormPropsContext } from "./FormPropsContext";

export const FormSection = (props: {
  edition: EditionMetadata;
  // in outline mode there is no response
  response?: ResponseDocument;
  /** /!\ starts at 1 */
  sectionNumber: number;
  readOnly?: boolean;
}) => {
  const {
    response: originalResponse,
    edition,
    sectionNumber,
    readOnly,
  } = props;
  const section = edition.sections[sectionNumber - 1];

  // number is 1-based, so use 0-based index instead
  const sectionIndex = sectionNumber - 1;
  const previousSection = edition.sections[sectionIndex - 1];
  const nextSection = edition.sections[sectionIndex + 1];

  const enableReadingList = !readOnly && edition.enableReadingList;

  const formProps = {
    ...props,
    survey: edition.survey,
    previousSection,
    nextSection,
    enableReadingList,
    section,
  };

  return (
    <div>
      <FormPropsContext.Provider value={formProps}>
        <FormStateContextProvider response={originalResponse}>
          <FormLayout
            section={section}
            previousSection={previousSection}
            nextSection={nextSection}
          >
            {section.questions
              .filter((q) => !q.hidden)
              .map((question, index) => (
                // TODO: the boundary "render" function has some where typings
                // @ts-ignore
                <ErrorBoundary
                  key={question.id}
                  fallbackComponent={({ error }) => (
                    <p>
                      Could not load question {question.id} ({error?.message})
                    </p>
                  )}
                >
                  <FormQuestion
                    key={question.id}
                    question={question}
                    questionNumber={index + 1}
                  />
                </ErrorBoundary>
              ))}
          </FormLayout>
        </FormStateContextProvider>
      </FormPropsContext.Provider>
    </div>
  );
};

export default FormSection;
