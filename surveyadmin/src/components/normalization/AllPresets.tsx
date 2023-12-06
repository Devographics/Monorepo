import {
  SurveyMetadata,
  QuestionMetadata,
  ResponseData,
  EditionMetadata,
  Entity,
} from "@devographics/types";
import { Dispatch, SetStateAction, useState } from "react";
import trim from "lodash/trim";
import without from "lodash/without";
import { useLocalStorage } from "../hooks";
import { addCustomTokens } from "~/lib/normalization/services";
import {
  NormalizationToken,
  NormalizeInBulkResult,
} from "~/lib/normalization/types";
import { NormalizationResult } from "./NormalizationResult";
import { FieldValue } from "./FieldValue";
import { EntityList, getAddEntityUrl, getEditEntityUrl } from "./EntityInput";
import type { CustomNormalization } from "./NormalizeQuestion";
import { usePresets } from "./hooks";
import { useCustomNormalizationMutation } from "./NormTokenAction";
import { addCustomTokensAction } from "./tokenActions";

const getCacheKey = (edition, question) =>
  `normalization_presets__${edition.id}__${question.id}`;

const AllPresets = ({
  survey,
  edition,
  question,
  questionData,
  responseId,
  normRespId,
  rawValue,
  rawPath,
  normPath,
  entities,
  tokens,
  setShowAllPresets,
}: {
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
  setShowAllPresets: Dispatch<SetStateAction<boolean>>;
}) => {
  const cacheKey = getCacheKey(edition, question);
  const [selectedId, setSelectedId] = useState("");
  const [tokensToAdd, setTokensToAdd] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NormalizeInBulkResult | null>(null);

  const { enabledPresets } = usePresets({ edition, question });

  const cacheKeyParams = {
    surveyId: survey.id,
    editionId: edition.id,
    questionId: question.id,
  };
  const addTokenMutation = useCustomNormalizationMutation(
    addCustomTokensAction,
    cacheKeyParams
  );

  const entityIds = questionData
    ? questionData.currentEdition.buckets.map((b) => b.id).slice(0, 20)
    : [];

  const handleSubmit = async (e) => {
    setLoading(true);
    setResult(null);
    e.preventDefault();

    const params = {
      ...cacheKeyParams,
      responseId,
      rawValue,
      rawPath,
      normPath,
      tokens: tokensToAdd,
    };
    const result = await addTokenMutation.mutateAsync(params);
    // console.log(result);
    setLoading(false);
    // if (result?.data) {
    //   setResult(result?.data);
    // }
    setShowAllPresets(false);
  };

  const addTokenId = (id: string) => {
    if (!tokensToAdd.includes(id)) {
      setTokensToAdd([...tokensToAdd, id]);
    }
  };

  const allEntitiesIds = entities.map((e) => e.id);

  return (
    <div className="manualinput">
      <table>
        <tbody>
          <tr>
            <th>Answer</th>
            <td>
              <FieldValue raw={rawValue} tokens={tokens} />
            </td>
          </tr>
          <tr>
            <th>Suggested Tokens</th>
            <td>
              <div>
                <ul className="tokens-list">
                  {entityIds.sort().map((id) => (
                    <Preset
                      key={id}
                      id={id}
                      tokensToAdd={tokensToAdd}
                      addTokenId={addTokenId}
                    />
                  ))}
                  {enabledPresets
                    .sort()
                    .filter((id) => !entityIds.includes(id))
                    .map((id) => (
                      <Preset
                        key={id}
                        id={id}
                        tokensToAdd={tokensToAdd}
                        addTokenId={addTokenId}
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
            <th>All Tokens</th>
            <td>
              <EntityList
                entities={entities}
                selectedId={selectedId}
                setSelectedId={(value) => {
                  setSelectedId(value);
                  if (allEntitiesIds.includes(value)) {
                    addTokenId(value);
                    setSelectedId("");
                  }
                }}
              />
            </td>
          </tr>
          <tr>
            <th>Tokens to add:</th>
            <td>
              <form className="manualinput-form">
                {tokensToAdd.map((t) => (
                  <code key={t}>{t}</code>
                ))}
                <button
                  aria-busy={addTokenMutation.isPending}
                  onClick={handleSubmit}
                >
                  Add Tokens
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
    </div>
  );
};

export const Preset = ({
  id,
  tokensToAdd,
  addTokenId,
}: {
  id: string;
  tokensToAdd: string[];
  addTokenId: (id: string) => void;
}) => {
  const isIncluded = tokensToAdd.includes(id);
  const style = {} as any;
  if (isIncluded) {
    style.opacity = 0.4;
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
            addTokenId(id);
          }}
        >
          {id}
        </code>
      </a>
    </li>
  );
};
export default AllPresets;
