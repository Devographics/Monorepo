import {
  SurveyMetadata,
  QuestionMetadata,
  ResponseData,
  EditionMetadata,
  Entity,
} from "@devographics/types";
import { useState } from "react";
import { NormalizationToken } from "~/lib/normalization/types";
import Dialog from "./Dialog";
import { AllPresets, usePresets } from "./AllPresets";
import { addManualNormalizations } from "~/lib/normalization/services";

export interface PresetsProps {
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
}

const Presets = (props: PresetsProps) => {
  const { edition, question } = props;
  const [showAllPresets, setShowAllPresets] = useState(false);

  const { enabledPresets } = usePresets({ edition, question });

  return (
    <div className="manualinput">
      {enabledPresets.length > 0 ? (
        <>
          <ul className="manualinput-presets">
            {enabledPresets.map((id) => (
              <Preset key={id} id={id} {...props} />
            ))}
          </ul>
          <a
            onClick={() => {
              setShowAllPresets(!showAllPresets);
            }}
            data-tooltip="Manually enter normalization tokens"
          >
            ✏️
          </a>
        </>
      ) : (
        <a
          onClick={() => {
            setShowAllPresets(!showAllPresets);
          }}
          data-tooltip="Manually enter normalization tokens"
        >
          Add tokens…
        </a>
      )}

      {showAllPresets && (
        <Dialog
          showModal={showAllPresets}
          setShowModal={setShowAllPresets}
          header={<span>Token Presets</span>}
        >
          <AllPresets {...props} />
        </Dialog>
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
    rawPath,
    entities,
  } = props;
  const [loading, setLoading] = useState(false);

  const entity = entities.find((e) => e.id === id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const tokens = [id];
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
  };

  return (
    <li data-tooltip="Add to custom normalization tokens">
      <code
        style={{ cursor: "pointer" }}
        onClick={handleSubmit}
        aria-busy={loading}
      >
        {id}
      </code>
    </li>
  );
};

export default Presets;
