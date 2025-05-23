import React from "react";
import { FormInputProps } from "../form/typings";
import { useQuestionTitle } from "~/lib/surveys/helpers/useQuestionTitle";

export const Subheading = (props: FormInputProps) => {
  const { section, question } = props;
  const { key, tHtml } = useQuestionTitle({ section, question });
  return (
    <div className="form-item-heading">
      <h4 data-key={key} dangerouslySetInnerHTML={{ __html: tHtml || "" }} />
    </div>
  );
};

export default Subheading;
