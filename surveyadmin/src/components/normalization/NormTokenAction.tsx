import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CommonNormalizationProps,
  getCustomNormalizationsCacheKey,
} from "./NormalizeQuestion";
import {
  SurveyMetadata,
  EditionMetadata,
  QuestionMetadata,
} from "@devographics/types";
import { Dispatch, SetStateAction, useState } from "react";
import { ActionDefinition, tokenActions } from "./tokenActions";
// import { AddCustomTokensProps } from "~/lib/normalization/actions";
// TODO
type AddCustomTokensProps = any;

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
  return;
};

export interface NormTokenProps {
  id: string;
  setTokenFilter: CommonNormalizationProps["setTokenFilter"];
}

export interface NormTokenActionProps extends NormTokenProps {
  survey?: SurveyMetadata;
  edition?: EditionMetadata;
  question?: QuestionMetadata;
  responseId?: string;
  rawValue?: string;
  rawPath?: string;
  normPath?: string;
  answerIndex?: number;
  onClick?: () => void;

  isRegular?: boolean;
  isDisabled?: boolean;
  isCustom?: boolean;
  isPreset?: boolean;
  isSuggested?: boolean;
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
    onClick,
    isSuggested,
  } = props;

  const [isLoading, setIsLoading] = useState(false);

  const action = getAction(props);

  const params: AddCustomTokensProps = {
    surveyId: survey?.id,
    editionId: edition?.id,
    questionId: question?.id,
    responseId,
    rawValue,
    rawPath,
    normPath,
    tokens: [id],
    answerIndex,
  };

  return (
    <>
      <code
        className={`normalization-token ${action?.className} ${
          isSuggested ? "normalization-token-suggested" : ""
        }`}
        aria-busy={isLoading}
      >
        <span
          onClick={(e) => {
            e.preventDefault();
            // setShowModal(true);
            setTokenFilter([id], "normalized");
            if (onClick) {
              onClick();
            }
          }}
          data-tooltip={`Filter by ${id}`}
        >
          {id}
        </span>
        {action && <Action {...{ action, params, setIsLoading }} />}
      </code>
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
  setIsLoading,
}: {
  action: ActionDefinition;
  params: AddCustomTokensProps;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}) => {
  const { description, icon } = action;

  const mutation = useCustomNormalizationMutation(action, params);

  return (
    <span
      className="token-action"
      data-tooltip={description}
      onClick={async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await mutation.mutate(params);
        setIsLoading(false);
      }}
    >
      {icon}
    </span>
  );
};
