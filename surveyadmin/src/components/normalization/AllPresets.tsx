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
import { usePresets } from "./hooks";

export const AllPresets = (props: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionMetadata;
  questionData?: ResponseData;
  entities: Entity[];
}) => {
  const { survey, edition, question, questionData, entities } = props;

  const allEntitiesIds = entities.map((e) => e.id);

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
        {defaultPresets
          .filter((p) => p !== "other_answers")
          .sort()
          .map((id) => (
            <Preset key={id} id={id} {...presetProps} />
          ))}
        {customPresets
          .filter((p) => !defaultPresets.includes(p))
          .sort()
          .map((id) => (
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
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionMetadata;
  questionData?: ResponseData;
  entities: Entity[];
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
