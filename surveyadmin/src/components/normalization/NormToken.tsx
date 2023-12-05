import { useState } from "react";
import { NormalizationResponse } from "~/lib/normalization/hooks";
import { ResponseId } from "./Answers";
import Dialog from "./Dialog";
import { FieldValue } from "./FieldValue";
import { splitResponses } from "~/lib/normalization/helpers/splitResponses";
import {
  Entity,
  SurveyMetadata,
  EditionMetadata,
  QuestionMetadata,
} from "@devographics/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDataCacheKey } from "./NormalizeQuestion";
import {
  addCustomTokens,
  disableRegularTokens,
  enableRegularTokens,
  removeCustomTokens,
} from "~/lib/normalization/services";

interface ActionDefinition {
  mutationFunction: any;
  description: string;
  icon: string;
  className: string;
}

const getAction = ({
  isRegular,
  isDisabled,
  isCustom,
  isPreset,
}: {
  isRegular?: boolean;
  isDisabled?: boolean;
  isCustom?: boolean;
  isPreset?: boolean;
}): ActionDefinition => {
  if (isRegular) {
    if (isDisabled) {
      // enable regular token
      return {
        mutationFunction: enableRegularTokens,
        description: "Re-enable regular (regex) token",
        icon: "✅",
        className: "normalization-token-regular normalization-token-disabled",
      };
    } else {
      // disable regular token
      return {
        mutationFunction: disableRegularTokens,
        description: "Disable regular (regex) token",
        icon: "🚫",
        className: "normalization-token-regular normalization-token-enabled",
      };
    }
  } else {
    if (isPreset) {
      // add custom tokens
      return {
        mutationFunction: addCustomTokens,
        description: "Add custom token",
        icon: "➕",
        className: "normalization-token-preset",
      };
    } else if (isCustom) {
      // remove custom tokens
      return {
        mutationFunction: removeCustomTokens,
        description: "Remove custom token",
        icon: "➖",
        className: "normalization-token-custom",
      };
    }
  }
  throw new Error("getAction did not return anything");
};

/*

Helper function to take result of mutation and update cache with it

*/
const updateCustomNormalization = (previous, data) => {
  console.log("// onSuccess!");
  console.log(previous);
  console.log(data);
  const newCustomNormalization = data.data.document;
  console.log(newCustomNormalization);
  // update the correct document with the one we just received from the server
  const newCustomNormalizations = previous.customNormalizations.map((c) =>
    c.responseId === newCustomNormalization.responseId
      ? newCustomNormalization
      : c
  );
  const newData = {
    ...previous,
    customNormalizations: newCustomNormalizations,
  };
  console.log(newData);
  return newData;
};

interface NormTokenProps {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionMetadata;
  responseId: string;
  rawValue: string;
  rawPath: string;
  normPath: string;
  id: string;
  responses: NormalizationResponse[];
  pattern?: string;
  isRegular?: boolean;
  isDisabled?: boolean;
  isCustom?: boolean;
  isPreset?: boolean;
  entities: Entity[];
}

const NormToken = (props: NormTokenProps) => {
  const {
    id,
    responses,
    responseId,
    rawValue,
    rawPath,
    normPath,
    survey,
    edition,
    question,
    entities,
  } = props;

  const entity = entities.find((e) => e.id === id);
  const [showModal, setShowModal] = useState(false);
  const { normalizedAnswers } = splitResponses(responses);
  const tokenAnswers = normalizedAnswers?.filter((a) =>
    a?.tokens.map((t) => t.id)?.includes(id)
  );

  const { mutationFunction, description, className, icon } = getAction(props);

  const queryClient = useQueryClient();

  const params = {
    surveyId: survey.id,
    editionId: edition.id,
    questionId: question.id,
    responseId,
    rawValue,
    rawPath,
    normPath,
    tokens: [id],
  };

  const mutation = useMutation({
    mutationFn: async (params) => await mutationFunction(params),
    onSuccess: (data, variables) => {
      queryClient.setQueriesData([getDataCacheKey(params)], (previous) =>
        updateCustomNormalization(previous, data)
      );
    },
  });

  return (
    <>
      <code
        className={`normalization-token ${className}`}
        aria-busy={mutation?.isPending}
      >
        <span
          onClick={(e) => {
            e.preventDefault();
            setShowModal(true);
          }}
          data-tooltip={entity?.descriptionClean}
        >
          {id}
        </span>
        <span
          className="token-action"
          data-tooltip={description}
          onClick={async (e) => {
            e.preventDefault();
            await mutation.mutate(params);
          }}
        >
          {icon}
        </span>
      </code>

      {showModal && (
        <Dialog
          showModal={showModal}
          setShowModal={setShowModal}
          header={
            <span>
              Answers matching <code>{id}</code> ({tokenAnswers.length})
            </span>
          }
        >
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Answer</th>
                <th>ResponseId</th>
              </tr>
            </thead>
            <tbody>
              {tokenAnswers?.map((response, i) => {
                const { raw, tokens, responseId } = response;
                return (
                  <tr key={i}>
                    <td>{i + 1}.</td>
                    <td>
                      <FieldValue
                        currentTokenId={id}
                        raw={raw}
                        tokens={tokens}
                      />
                    </td>
                    <td>
                      <ResponseId id={responseId} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Dialog>
      )}
    </>
  );
};

export default NormToken;
