import {
  SurveyMetadata,
  QuestionMetadata,
  ResponseData,
  EditionMetadata,
  Entity,
} from "@devographics/types";
import { Dispatch, SetStateAction, useState } from "react";
// import { useLocalStorage } from "../hooks";
import { NormalizationToken } from "~/lib/normalization/types";
import { EntityList } from "./EntityInput";
import without from "lodash/without";
import { useLocalStorage } from "@uidotdev/usehooks";
import { PresetsProps } from "./Presets";

const getCacheKey = (edition, question) =>
  `normalization_presets__${edition.id}__${question.id}`;

export const usePresets = ({
  edition,
  question,
}: {
  edition: EditionMetadata;
  question: QuestionMetadata;
}) => {
  const cacheKey = getCacheKey(edition, question);

  const [customPresets, setCustomPresets] = useLocalStorage<string[]>(
    cacheKey + "__custom",
    []
  );
  const [enabledPresets, setEnabledPresets] = useLocalStorage<string[]>(
    cacheKey + "__enabled",
    []
  );
  return { enabledPresets, setEnabledPresets, customPresets, setCustomPresets };
};

export const AllPresets = (props: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionMetadata;
  questionData?: ResponseData;
  responseId: string;
  normRespId: string;
  rawValue: string;
  rawPath: string;
  entities: Entity[];
  tokens: NormalizationToken[];
}) => {
  const {
    survey,
    edition,
    question,
    questionData,
    responseId,
    normRespId,
    rawValue,
    rawPath,
    entities,
    tokens,
  } = props;

  const allEntitiesIds = entities.map((e) => e.id);

  const cacheKey = getCacheKey(edition, question);
  const [selectedId, setSelectedId] = useState("");

  const { enabledPresets, setEnabledPresets, customPresets, setCustomPresets } =
    usePresets({ edition, question });

  const defaultPresets = questionData
    ? questionData.currentEdition.buckets.map((b) => b.id).slice(0, 20)
    : [];

  const enablePreset = (id) => {
    setEnabledPresets([...enabledPresets, id]);
  };
  const disablePreset = (id) => {
    setEnabledPresets(without(enabledPresets, id));
  };

  const addCustomPreset = (id) => {
    setCustomPresets([...customPresets, id]);
    enablePreset(id);
  };

  const presetProps = {
    enabledPresets,
    enablePreset,
    disablePreset,
    ...props,
  };
  return (
    <div className="manualinput">
      <p>Pick which tokens should appear in the token shortlist.</p>

      <ul className="manualinput-presets">
        {defaultPresets.sort().map((id) => (
          <Preset key={id} id={id} {...presetProps} />
        ))}
        {customPresets.sort().map((id) => (
          <Preset key={id} id={id} isCustom={true} {...presetProps} />
        ))}
      </ul>
      <table>
        <tbody>
          <tr>
            <th>Add More Tokens…</th>
            <td>
              <EntityList
                entities={entities}
                selectedId={selectedId}
                setSelectedId={(value) => {
                  setSelectedId(value);
                  if (allEntitiesIds.includes(value)) {
                    addCustomPreset(value);
                    setSelectedId("");
                  }
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export const Preset = ({
  id,
  enabledPresets,
  enablePreset,
  disablePreset,
  isCustom,
  entities,
}: PresetsProps & {
  id: string;
  enabledPresets: string[];
  enablePreset: (string) => void;
  disablePreset: (string) => void;
  isCustom?: boolean;
}) => {
  const entity = entities.find((e) => e.id === id);

  const isEnabled = enabledPresets.includes(id);
  const style = {} as any;
  if (!isEnabled) {
    style.opacity = 0.7;
  }
  if (isCustom) {
    style.background = "#E7FFCF";
  }
  return (
    <li>
      <code
        style={style}
        data-tooltip={entity?.descriptionClean}
        onClick={(e) => {
          if (isEnabled) {
            disablePreset(id);
          } else {
            enablePreset(id);
          }
        }}
      >
        <input type="checkbox" checked={isEnabled} readOnly />
        {id}
      </code>
    </li>
  );
};
