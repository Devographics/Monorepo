"use client";
import { getQuestionComponent } from "~/lib/customComponents";
import { getFormPaths } from "@devographics/templates";
import { getQuestionObject } from "~/lib/surveys/helpers/getQuestionObject";

export const FormQuestion = (props) => {
  const {
    survey,
    edition,
    section,
    response,
    question,
    index,
    sectionNumber,
    questionNumber,
  } = props;

  const formPaths = getFormPaths({ edition, question });
  const questionObject = getQuestionObject({
    survey,
    edition,
    section,
    question,
  });
  const Component = getQuestionComponent(questionObject);
  const path = formPaths.response;
  if (!path && !["receive_notifications"].includes(questionObject.template)) {
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
    sectionNumber,
    questionNumber,
  };

  const classNames = [
    "form-input",
    `question-id-${question.id}`,
    `question-template-${question.template}`,
    `question-section-${section.id}`,
  ];
  return (
    <div className={classNames.join(" ")}>
      <Component {...componentProperties} />
    </div>
  );
};

export default FormQuestion;
