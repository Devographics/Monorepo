import { useNormTokenStuff, Modal, NormTokenProps } from "./NormToken";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDataCacheKey } from "./NormalizeQuestion";
import {
  SurveyMetadata,
  EditionMetadata,
  QuestionMetadata,
} from "@devographics/types";
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

/*

Get action definition based on token context

*/
export const getAction = ({
  isRegular,
  isDisabled,
  isCustom,
  isPreset,
}: {
  isRegular?: boolean;
  isDisabled?: boolean;
  isCustom?: boolean;
  isPreset?: boolean;
}): ActionDefinition | null => {
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
        icon: "➖",
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
  return null;
};

export interface NormTokenActionProps extends NormTokenProps {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionMetadata;
  responseId: string;
  rawValue: string;
  rawPath: string;
  normPath: string;

  isRegular?: boolean;
  isDisabled?: boolean;
  isCustom?: boolean;
  isPreset?: boolean;
}

/*

Helper function to take result of mutation and update cache with it

*/
const updateCustomNormalization = (previous, data, variables, action) => {
  console.log(`[${action.description}] ${variables.tokens.join()}`);
  const newCustomNormalization = data.data.document;
  let newCustomNormalizations;
  if (
    previous.customNormalizations.find(
      (c) => c.responseId === newCustomNormalization.responseId
    )
  ) {
    // update the correct document with the one we just received from the server
    newCustomNormalizations = previous.customNormalizations.map((c) =>
      c.responseId === newCustomNormalization.responseId
        ? newCustomNormalization
        : c
    );
  } else {
    // add new normalization to the array
    newCustomNormalizations = [
      ...previous.customNormalizations,
      newCustomNormalization,
    ];
  }
  const newData = {
    ...previous,
    customNormalizations: newCustomNormalizations,
  };
  return newData;
};

/*

Action button component

*/
export const Action = ({ action, params, setShowModal, entity, id }) => {
  const { mutationFunction, description, className, icon } = action;

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params) => await mutationFunction(params),
    onSuccess: (data, variables) => {
      queryClient.setQueriesData([getDataCacheKey(params)], (previous) =>
        updateCustomNormalization(previous, data, variables, action)
      );
    },
  });

  return (
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
  );
};

/*

Norm token with action button

*/
export const NormTokenAction = (props: NormTokenActionProps) => {
  const {
    id,
    responseId,
    rawValue,
    rawPath,
    normPath,
    survey,
    edition,
    question,
  } = props;

  const { entity, showModal, setShowModal, tokenAnswers } =
    useNormTokenStuff(props);
  const action = getAction(props);

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

  return (
    <>
      <Action {...{ action, params, setShowModal, entity, id }} />
      {showModal && (
        <Modal {...{ showModal, setShowModal, id, tokenAnswers }} />
      )}
    </>
  );
};
