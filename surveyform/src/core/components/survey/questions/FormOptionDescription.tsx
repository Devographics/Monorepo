import React from "react";

const FormOptionDescription = ({ optionDescription }) => {
  return (
    <span
      className="form-option-description"
      dangerouslySetInnerHTML={{ __html: optionDescription }}
    />
  );
};

export default FormOptionDescription;
