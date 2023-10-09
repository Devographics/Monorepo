import {
  SurveyMetadata,
  QuestionMetadata,
  ResponseData,
  EditionMetadata,
  Entity,
} from "@devographics/types";
import { useState } from "react";
import trim from "lodash/trim";
import without from "lodash/without";
import { useLocalStorage } from "../hooks";
import { addManualNormalizations } from "~/lib/normalization/services";
import { NormalizeInBulkResult } from "~/lib/normalization/types";
import { NormalizationResult } from "./NormalizationResult";
import { FieldValue } from "./FieldValue";
import { EntityList } from "./EntityInput";

const getCacheKey = (edition, question) =>
  `normalization_presets__${edition.id}__${question.id}`;

const ManualInput = ({
  survey,
  edition,
  question,
  questionData,
  responseId,
  normRespId,
  rawValue,
  rawPath,
  entities,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionMetadata;
  questionData: ResponseData;
  responseId: string;
  normRespId: string;
  rawValue: string;
  rawPath: string;
  entities: Entity[];
}) => {
  const cacheKey = getCacheKey(edition, question);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NormalizeInBulkResult | null>(null);
  const [localPresets, setLocalPresets] = useLocalStorage(cacheKey, []);
  const entityIds = questionData.currentEdition.buckets
    .map((b) => b.id)
    .slice(0, 20);

  const handleSubmit = async (e) => {
    setLoading(true);
    setResult(null);
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
      rawValue,
      rawPath,
    };
    const result = await addManualNormalizations(params);

    setLoading(false);
    if (result.data) {
      setResult(result.data);
    }
  };

  const handleDeletePreset = (preset) => {
    setLocalPresets(without(localPresets, preset));
  };

  return (
    <div className="manualinput">
      <p>
        <FieldValue value={rawValue} />
      </p>
      <h5>Presets</h5>
      <p>
        <small>
          Presets are populated from the top responses to the question; and
          locally-stored values.
        </small>
      </p>
      <p>
        <ul className="manualinput-presets">
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
        </ul>
      </p>
      <h5>Manual IDs</h5>
      <form className="manualinput-form">
        {/* <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        /> */}

        <EntityList
          entities={entities}
          selectedId={value}
          setSelectedId={setValue}
        />
        <button aria-busy={loading} onClick={handleSubmit}>
          Renormalize
        </button>
      </form>
      {result && (
        <div>
          <p>Field has been renormalized with new custom values.</p>
          <NormalizationResult {...result} />
          {/* <pre>
            <code>{JSON.stringify(result, null, 2)}</code>
          </pre> */}
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
    <li>
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
    </li>
  );
};
export default ManualInput;
