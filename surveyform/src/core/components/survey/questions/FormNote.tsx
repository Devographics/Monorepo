import React from "react";
import rehypeRaw from "rehype-raw";
import { DynamicReactMarkdown } from "~/core/components/markdown/DynamicReactMarkdown";

const FormNote = ({ note }) => {
  return (
    <div className="form-note">
      <DynamicReactMarkdown rehypePlugins={[rehypeRaw]}>
        {note}
      </DynamicReactMarkdown>
    </div>
  );
};

export default FormNote;
