"use client";
import { getQuestionComponent } from "~/lib/customComponents";
import { getFormPaths } from "~/lib/surveys/helpers";

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
  const Component = getQuestionComponent(question);
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
