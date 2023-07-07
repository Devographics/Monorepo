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
  const value = path && response?.[path];

  const componentProperties = {
    ...props,
    question,
    path,
    value,
    sectionNumber,
    questionNumber,
  };

  //console.log("rendering FormQuestion", { response, value });

  return (
    <div className="form-input">
      <Component {...componentProperties} />
      {/* <pre>
        <code>{JSON.stringify(question, null, 2)}</code>
      </pre> */}
    </div>
  );
};

export default FormQuestion;
