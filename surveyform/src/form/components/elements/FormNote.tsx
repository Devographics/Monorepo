import React from "react";

const FormNote = ({ note }) => {
  return (
    <div className="form-note" dangerouslySetInnerHTML={{ __html: note }} />
  );
};

export default FormNote;
