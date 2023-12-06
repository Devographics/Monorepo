import {
  addCustomTokens,
  disableRegularTokens,
  enableRegularTokens,
  removeCustomTokens,
} from "~/lib/normalization/services";

export interface ActionDefinition {
  mutationFunction: any;
  description: string;
  icon: string;
  className: string;
}

export const enableRegularTokensAction: ActionDefinition = {
  mutationFunction: enableRegularTokens,
  description: "Re-enable regular (regex) token",
  icon: "🔄",
  className: "normalization-token-regular normalization-token-disabled",
};

export const disableRegularTokensAction: ActionDefinition = {
  mutationFunction: disableRegularTokens,
  description: "Disable regular (regex) token",
  icon: "➖",
  className: "normalization-token-regular normalization-token-enabled",
};

export const addCustomTokensAction: ActionDefinition = {
  mutationFunction: addCustomTokens,
  description: "Add custom token",
  icon: "➕",
  className: "normalization-token-preset",
};

export const removeCustomTokensAction: ActionDefinition = {
  mutationFunction: removeCustomTokens,
  description: "Remove custom token",
  icon: "➖",
  className: "normalization-token-custom",
};

export const tokenActions = {
  enableRegularTokens: enableRegularTokensAction,
  disableRegularTokens: disableRegularTokensAction,
  addCustomTokens: addCustomTokensAction,
  removeCustomTokens: removeCustomTokensAction,
};
