import React from "react";

export interface FormDescriptionProps {
  description?: string;
  descriptionHtml?: string;
}

export const FormDescription = ({ description, descriptionHtml }: FormDescriptionProps) => {
  return (
    <div
      className="form-description"
      dangerouslySetInnerHTML={{ __html: descriptionHtml || description }}
    />
  );
};

export default FormDescription;
