"use client";
import FormLayout from "./FormLayout";
import FormQuestion from "./FormQuestion";

export const FormSection = (props) => {
  const { edition, section, response, sectionNumber } = props;
  return (
    <div>
      <FormLayout {...props}>
        {section.questions.map((question) => (
          <FormQuestion key={question.id} {...props} question={question} />
        ))}
      </FormLayout>
    </div>
  );
};

export default FormSection;
