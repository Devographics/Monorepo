import React from "react";
import Form from "react-bootstrap/Form";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export interface FormDescriptionProps {
  description: string;
}
export const FormDescription = ({ description }: FormDescriptionProps) => {
  return (
    <div
      className="form-description"
      dangerouslySetInnerHTML={{ __html: description }}
    />
  );
};

export default FormDescription;
