import { useNormTokenStuff, Modal, NormTokenProps } from "./NormToken";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CommonNormalizationProps,
  getCustomNormalizationsCacheKey,
  getDataCacheKey,
} from "./NormalizeQuestion";
import {
  SurveyMetadata,
  EditionMetadata,
  QuestionMetadata,
  Entity,
} from "@devographics/types";
// import { AddCustomTokensProps } from "~/lib/normalization/actions";
// TODO
type AddCustomTokensProps = any;
import { Dispatch, SetStateAction } from "react";
import { ActionDefinition, tokenActions } from "./tokenActions";

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
}) => {
  if (isRegular) {
    if (isDisabled) {
      // enable regular token
      return tokenActions.enableRegularTokens;
    } else {
      // disable regular token
      return tokenActions.disableRegularTokens;
    }
  } else {
    if (isPreset) {
      // add custom tokens
      return tokenActions.addCustomTokens;
    } else if (isCustom) {
      // remove custom tokens
      return tokenActions.removeCustomTokens;
    }
  }
  throw Error("getAction: could not find action");
};

export interface NormTokenActionProps extends NormTokenProps {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionMetadata;
  responseId: string;
  rawValue: string;
  rawPath: string;
  normPath: string;
  answerIndex: number;
  setTokenFilter: CommonNormalizationProps["setTokenFilter"];

  isRegular?: boolean;
  isDisabled?: boolean;
  isCustom?: boolean;
  isPreset?: boolean;
}

/*

Helper function to take result of mutation and update cache with it

*/
export const updateCustomNormalization = (
  customNormalizations,
  data,
  variables,
  action
) => {
  console.log(
    `[${action.description}] ${variables.rawValue} | ${variables.tokens.join()}`
  );
  const newDocument = data.data.document;
  let newCustomNormalizations;
  if (
    customNormalizations.find((c) => c.responseId === newDocument.responseId)
  ) {
    // update the correct document with the one we just received from the server
    newCustomNormalizations = customNormalizations.map((c) =>
      c.responseId === newDocument.responseId ? newDocument : c
    );
  } else {
    // add new normalization to the array
    newCustomNormalizations = [...customNormalizations, newDocument];
  }
  return newCustomNormalizations;
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
    answerIndex,
    setTokenFilter,
  } = props;

  const { entity, showModal, setShowModal, tokenAnswers } =
    useNormTokenStuff(props);
  const action = getAction(props);

  const params: AddCustomTokensProps = {
    surveyId: survey.id,
    editionId: edition.id,
    questionId: question.id,
    responseId,
    rawValue,
    rawPath,
    normPath,
    tokens: [id],
    answerIndex,
  };

  return (
    <>
      <Action
        {...{ action, params, setShowModal, entity, id, setTokenFilter }}
      />
      {showModal && (
        <Modal {...{ showModal, setShowModal, id, tokenAnswers }} />
      )}
    </>
  );
};

/*

Hook to build mutation with correct action

*/
export const useCustomNormalizationMutation = (action, cacheKeyParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AddCustomTokensProps) =>
      await action.mutationFunction(params),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        [getCustomNormalizationsCacheKey(cacheKeyParams)],
        (previous) =>
          updateCustomNormalization(previous, data, variables, action)
      );
    },
  });
};

/*

Action button component

*/

export const Action = ({
  action,
  params,
  setShowModal,
  setTokenFilter,
  entity,
  id,
}: {
  action: ActionDefinition;
  params: AddCustomTokensProps;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setTokenFilter: CommonNormalizationProps["setTokenFilter"];
  entity?: Entity;
  id: string;
}) => {
  const { description, className, icon } = action;

  const mutation = useCustomNormalizationMutation(action, params);

  return (
    <code
      className={`normalization-token ${className}`}
      aria-busy={mutation?.isPending}
    >
      <span
        onClick={(e) => {
          e.preventDefault();
          // setShowModal(true);
          setTokenFilter([id]);
        }}
        data-tooltip={`Filter by ${id}`}
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
