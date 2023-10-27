"use client";
import { getQuestionComponent } from "~/lib/customComponents";
import { getFormPaths } from "@devographics/templates";
import { getQuestionObject } from "~/lib/surveys/helpers/getQuestionObject";
import { DbPathsEnum } from "@devographics/types";

export const FormItemWrapper = (props) => {
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

  const skipPath = formPaths[DbPathsEnum.SKIP]!;
  const isSkipped = response?.[skipPath];
  const readOnly = !!isSkipped ? true : props.readOnly;

  const componentProperties = {
    ...props,
    question,
    path,
    value,
    sectionNumber,
    questionNumber,
    readOnly,
  };

  const classNames = [
    "form-item-wrapper",
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

export default FormItemWrapper;
