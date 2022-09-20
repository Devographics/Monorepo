import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

const FormNote = ({ note }) => {
  return (
    <div className="form-note">
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{note}</ReactMarkdown>
    </div>
  );
};

export default FormNote;
