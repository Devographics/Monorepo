"use client";
import { getQuestionComponent } from "~/lib/customComponents";
import { getFormPaths } from "@devographics/templates";
import { getQuestionObject } from "~/lib/surveys/helpers/getQuestionObject";
import { useFormStateContext } from "./FormStateContext";
import { useFormPropsContext } from "./FormPropsContext";
import { QuestionMetadata } from "@devographics/types";

export const FormItemWrapper = (props: {
  question: QuestionMetadata;
  /** Starts at 1 */
  questionNumber: number;
}) => {
  const { question, questionNumber } = props;
  const { response, updateCurrentValues } = useFormStateContext();
  const formProps = useFormPropsContext();
  const { edition, survey, section } = formProps;

  const formPaths = getFormPaths({ edition, question });
  const questionObject = getQuestionObject({
    survey,
    edition,
    section,
    question,
  });
  const Component = getQuestionComponent(questionObject);
  const path = formPaths.response;
  if (
    !path &&
    !["receive_notifications", "help"].includes(questionObject.template)
  ) {
    // there are a few legitimate cases where we have no path, but otherwise it means the template is not known by the API
    console.warn(
      `path not defined for a question with template ${questionObject.template}. Is there a matching template implementation?`
    );
  }
  const value = path && response?.[path];

  const componentProperties = {
    ...props,
    question,
    path,
    value,
    questionNumber,
    // pass context values so we don't have to refactor all components
    ...formProps,
    updateCurrentValues,
  };

  const classNames = [
    "form-item-wrapper",
    `question-id-${question.id}`,
    `question-template-${question.template}`,
    `question-section-${section.id}`,
  ];
  return (
    <div className={classNames.join(" ")}>
      {/**  @ts-ignore https://github.com/vercel/next.js/issues/37421 */}
      <Component {...componentProperties} />
    </div>
  );
};

export default FormItemWrapper;
