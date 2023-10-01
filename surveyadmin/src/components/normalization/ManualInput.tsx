import {
  SurveyMetadata,
  QuestionMetadata,
  ResponseData,
  EditionMetadata,
} from "@devographics/types";
import { useState } from "react";
import trim from "lodash/trim";
import without from "lodash/without";
import { useLocalStorage } from "../hooks";
import { addManualNormalizations } from "~/lib/normalization/services";
import { AddManualNormalizationResult } from "~/lib/normalization/actions";

const getCacheKey = (edition, question) =>
  `normalization_presets__${edition.id}__${question.id}`;

const ManualInput = ({
  survey,
  edition,
  question,
  questionData,
  responseId,
  normRespId,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionMetadata;
  questionData: ResponseData;
  responseId: string;
  normRespId: string;
}) => {
  const cacheKey = getCacheKey(edition, question);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AddManualNormalizationResult | null>(
    null
  );
  const [localPresets, setLocalPresets] = useLocalStorage(cacheKey, []);
  const entityIds = questionData.currentEdition.buckets.map((b) => b.id);

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const tokens = value.split(",").map((s) => trim(s));
    tokens.forEach((token) => {
      if (![...entityIds, ...localPresets].includes(token)) {
        setLocalPresets([...localPresets, token]);
      }
    });

    const params = {
      surveyId: survey.id,
      editionId: edition.id,
      questionId: question.id,
      tokens,
      responseId,
      normRespId,
    };
    console.log(params);
    const result = await addManualNormalizations(params);

    setLoading(false);
    setResult(result);
  };

  const handleDeletePreset = (preset) => {
    setLocalPresets(without(localPresets, preset));
  };

  return (
    <div className="manualinput">
      <h5>Presets</h5>
      <p>
        <small>
          Presets are populated from the top responses to the question; and
          locally-stored values.
        </small>
      </p>
      <p className="manualinput-presets">
        {entityIds.map((id) => (
          <Preset key={id} id={id} value={value} setValue={setValue} />
        ))}
        {localPresets.map((id) => (
          <Preset
            key={id}
            id={id}
            value={value}
            setValue={setValue}
            isLocal={true}
            handleDeletePreset={handleDeletePreset}
          />
        ))}
      </p>
      <h5>Manual IDs</h5>
      <form className="manualinput-form">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button aria-busy={loading} onClick={handleSubmit}>
          Renormalize
        </button>
      </form>
      {result && (
        <div>
          <p>Field has been renormalized with new custom values.</p>
          <pre>
            <code>{JSON.stringify(result, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

const Preset = ({
  id,
  value,
  setValue,
  isLocal,
  handleDeletePreset,
}: {
  id: string;
  value: string;
  setValue: any;
  isLocal?: boolean;
  handleDeletePreset?: any;
}) => {
  const isIncluded = value.includes(id);
  const style = {} as any;
  if (isIncluded) {
    style.opacity = 0.4;
  }
  if (isLocal) {
    style.background = "#E7FFCF";
  }
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
      }}
    >
      <code
        style={style}
        onClick={(e) => {
          const separator = !!value ? ", " : "";
          setValue(value + separator + id);
        }}
      >
        {id}
      </code>
      {isLocal && (
        <span
          onClick={() => {
            handleDeletePreset(id);
          }}
        >
          X
        </span>
      )}
    </a>
  );
};
export default ManualInput;
