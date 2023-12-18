import {
  SurveyMetadata,
  QuestionMetadata,
  ResponseData,
  EditionMetadata,
  Entity,
} from "@devographics/types";
import { Dispatch, SetStateAction, useState } from "react";
import { NormalizationToken } from "~/lib/normalization/types";
import { usePresets } from "./hooks";
import { addCustomTokens } from "~/lib/normalization/services";

export interface PresetsProps {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionMetadata;
  questionData?: ResponseData;
  responseId: string;
  normRespId: string;
  rawValue: string;
  rawPath: string;
  normPath: string;
  entities: Entity[];
  tokens: NormalizationToken[];
  showPresetsShortlistModal: () => void;
  answerIndex: number;
}

const Presets = (props: PresetsProps) => {
  const { edition, question, showPresetsShortlistModal } = props;

  const { enabledPresets } = usePresets({ edition, question });

  return (
    <div className="manualinput">
      {enabledPresets.length > 0 ? (
        <div className="manualinput-presets">
          {enabledPresets.map((id) => (
            <Preset key={id} id={id} {...props} />
          ))}
        </div>
      ) : (
        <a
          onClick={() => {
            showPresetsShortlistModal();
          }}
          data-tooltip="Add normalization token presets to shortlist"
        >
          Add tokens…
        </a>
      )}
    </div>
  );
};

export const Preset = (props: PresetsProps & { id: string }) => {
  const {
    id,
    survey,
    edition,
    question,
    responseId,
    normRespId,
    rawValue,
    normPath,
    rawPath,
    entities,
    tokens,
    answerIndex,
  } = props;

  const isAlreadyIncluded = tokens.some((t) => t.id === id);

  const [loading, setLoading] = useState(false);

  const entity = entities.find((e) => e.id === id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAlreadyIncluded) {
      return;
    }
    setLoading(true);
    const tokens = [id];
    const params = {
      surveyId: survey.id,
      editionId: edition.id,
      questionId: question.id,
      tokens,
      responseId,
      rawValue,
      normPath,
      rawPath,
      answerIndex,
    };
    const result = await addCustomTokens(params);
    setLoading(false);
  };

  const style = isAlreadyIncluded
    ? {
        cursor: "not-allowed",
        opacity: 0.4,
      }
    : {
        cursor: "pointer",
      };

  return (
    <div
      data-tooltip={
        isAlreadyIncluded
          ? "Already adeed"
          : "Add to custom normalization tokens"
      }
    >
      <code style={style} onClick={handleSubmit} aria-busy={loading}>
        {id}
      </code>
    </div>
  );
};

export default Presets;
