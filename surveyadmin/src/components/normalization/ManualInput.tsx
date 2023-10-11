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
import { EntityList, getAddEntityUrl, getEditEntityUrl } from "./EntityInput";

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
  questionData?: ResponseData;
  responseId: string;
  normRespId: string;
  rawValue: string;
  rawPath: string;
  entities: Entity[];
}) => {
  const cacheKey = getCacheKey(edition, question);
  const [selectedId, setSelectedId] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NormalizeInBulkResult | null>(null);
  const [localPresets, setLocalPresets] = useLocalStorage(cacheKey, []);
  const entityIds = questionData
    ? questionData.currentEdition.buckets.map((b) => b.id).slice(0, 20)
    : [];

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

  const addEntityId = (id) => {
    if (!value.includes(id)) {
      const separator = !!value ? ", " : "";
      setValue(value + separator + id);
    }
  };

  const allEntitiesIds = entities.map((e) => e.id);

  const valueIds = value ? value.split(",").map((v) => trim(v)) : [];
  const unknownEntitiesIds = valueIds.filter(
    (v) => !!v && !allEntitiesIds.includes(v)
  );
  const knownEntitiesIds = valueIds.filter(
    (v) => !!v && allEntitiesIds.includes(v)
  );

  return (
    <div className="manualinput">
      <table>
        <tbody>
          <tr>
            <th>Answer</th>
            <td>
              <FieldValue value={rawValue} />
            </td>
          </tr>
          <tr>
            <th>Suggested Entities</th>
            <td>
              <div>
                <ul className="manualinput-presets">
                  {entityIds.map((id) => (
                    <Preset
                      key={id}
                      id={id}
                      value={value}
                      setValue={setValue}
                      addEntityId={addEntityId}
                    />
                  ))}
                  {localPresets.map((id) => (
                    <Preset
                      key={id}
                      id={id}
                      value={value}
                      setValue={setValue}
                      isLocal={true}
                      addEntityId={addEntityId}
                      handleDeletePreset={handleDeletePreset}
                    />
                  ))}
                </ul>
              </div>
              <p>
                <small>
                  Suggested entities are populated from the top responses to the
                  question and locally-stored values.
                </small>
              </p>
            </td>
          </tr>
          <tr>
            <th>Search All Entities</th>
            <td>
              <EntityList
                entities={entities}
                selectedId={selectedId}
                setSelectedId={(value) => {
                  setSelectedId(value);
                  if (allEntitiesIds.includes(value)) {
                    addEntityId(value);
                    setSelectedId("");
                  }
                }}
              />
            </td>
          </tr>
          <tr>
            <th>Normalization IDs</th>
            <td>
              <form className="manualinput-form">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />

                <button aria-busy={loading} onClick={handleSubmit}>
                  Submit
                </button>
              </form>
              {result && (
                <div>
                  <p>Custom normalization has been added.</p>
                  {/* <NormalizationResult {...result} /> */}
                  {/* <pre>
            <code>{JSON.stringify(result, null, 2)}</code>
          </pre> */}
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>
      {[...unknownEntitiesIds, ...knownEntitiesIds].length > 0 && (
        <p>
          <ul>
            {unknownEntitiesIds.map((id) => (
              <li key={id}>
                Entity <code>{id}</code> does not exist yet.{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={getAddEntityUrl(id, question.id)}
                >
                  Create it?
                </a>
              </li>
            ))}
            {knownEntitiesIds.map((id) => (
              <li key={id}>
                Add missing matching patterns to entity <code>{id}</code>?{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={getEditEntityUrl(
                    id,
                    entities.find((e) => e.id === id)?.patterns
                  )}
                >
                  Suggest edit
                </a>
              </li>
            ))}
          </ul>
        </p>
      )}
    </div>
  );
};

const Preset = ({
  id,
  value,
  setValue,
  isLocal,
  addEntityId,
  handleDeletePreset,
}: {
  id: string;
  value: string;
  setValue: any;
  isLocal?: boolean;
  addEntityId?: any;
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
            addEntityId(id);
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
