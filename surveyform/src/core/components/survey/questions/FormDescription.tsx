import React from "react";
import Form from "react-bootstrap/Form";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export interface FormDescriptionProps {
  description: string;
}
export const FormDescription = ({ description }: FormDescriptionProps) => {
  return (
    <Form.Text>
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{description}</ReactMarkdown>
    </Form.Text>
  );
};

export default FormDescription;
