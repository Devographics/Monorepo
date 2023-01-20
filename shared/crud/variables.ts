/**
 * Compute variables for mutation hooks
 *
 *
 * TODO: do we still need this or can we put everything into "input" for "update" mutation?
 */
import _merge from "lodash/merge.js";

interface VulcanMutationOptions {
  _id?: string;
  input?: Object;
}
/**
 * Compute the _id or input based on default options of the hooks
 * + dynamic props (for single) ggor dynamic arguments (for update)
 * @param {*} options
 * @param {*} argsOrProps
 */
export const computeQueryVariables = (
  options: VulcanMutationOptions,
  argsOrProps: VulcanMutationOptions
): VulcanMutationOptions => {
  const { _id: optionsId, input: optionsInput = {} } = options;
  const { _id: argsId, input: argsInput = {} } = argsOrProps;
  const _id = argsId || optionsId || undefined; // use dynamic _id in priority, default _id otherwise
  const input = !_id ? _merge({}, optionsInput, argsInput) : undefined; // if _id is defined ignore input, else use dynamic input in priority
  const variables: VulcanMutationOptions = {};
  // Beware: MockProvider is sensitive to undefined values in variables
  // If a value is undefined, don't add it at all in the variables
  if (_id) {
    variables._id = _id;
  }
  if (input) {
    variables.input = input;
  }
  return variables;
};
