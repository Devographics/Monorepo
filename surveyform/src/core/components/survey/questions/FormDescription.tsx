import React from "react";

export interface FormDescriptionProps {
  description: string;
}

export const FormDescription = ({ description, descriptionHtml }: FormDescriptionProps) => {
  return (
    <div
      className="form-description"
      dangerouslySetInnerHTML={{ __html: description }}
    />
  );
};

export default FormDescription;
