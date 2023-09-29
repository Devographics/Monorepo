import { QuestionMetadata, ResponseData } from "@devographics/types";
import { useState } from "react";

const ManualInput = ({
  question,
  questionData,
}: {
  question: QuestionMetadata;
  questionData: ResponseData;
}) => {
  const [value, setValue] = useState("");
  const entityIds = questionData.currentEdition.buckets.map((b) => b.id);
  return (
    <div className="manualinput">
      <h5>Presets</h5>
      <p>
        <small>
          Presets are populated from the top responses to the question.
        </small>
      </p>
      <p className="manualinput-presets">
        {entityIds.map((id) => (
          <Preset key={id} id={id} value={value} setValue={setValue} />
        ))}
      </p>
      <h5>Manual IDs</h5>
      <div className="manualinput-form">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button>Submit</button>
      </div>
    </div>
  );
};

const Preset = ({ id, value, setValue }) => {
  const isIncluded = value.includes(id);
  const style = isIncluded ? { opacity: 0.4 } : {};
  return (
    <a
      href="#"
      style={style}
      onClick={(e) => {
        e.preventDefault();
        const separator = !!value ? ", " : "";
        setValue(value + separator + id);
      }}
    >
      <code>{id}</code>
    </a>
  );
};
export default ManualInput;
