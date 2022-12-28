// /*

// Generic mutation wrapper to update a document in a collection.

// Sample mutation:

//   mutation updateMovie($input: UpdateMovieInput) {
//     updateMovie(input: $input) {
//       data {
//         _id
//         name
//         __typename
//       }
//       __typename
//     }
//   }

// Arguments:

//   - input
//     - input.selector: a selector to indicate the document to update
//     - input.data: the document (set a field to `null` to delete it)

// Child Props:

//   - updateMovie({ selector, data })

// */

import { useMutation, UseMutationState } from "urql";
import gql from "graphql-tag";

import {
  Fragment,
  getModelFragment,
  updateClientTemplate,
} from "@vulcanjs/graphql";

import { multiQueryUpdater, ComputeNewDataFunc } from "./multiQueryUpdater";
// import { computeQueryVariables } from "./variables";
import { computeNewDataAfterCreate } from "./create";
import type { VulcanMutationHookOptions } from "./typings";
import type { VulcanGraphqlModel } from "@vulcanjs/graphql"; // TODO: import client code only
import type { UpdateVariables } from "@vulcanjs/crud";

// We can reuse the same function to compute the new list after an element update
const computeNewDataAfterUpdate: ComputeNewDataFunc = computeNewDataAfterCreate;

const multiQueryUpdaterAfterUpdate = multiQueryUpdater(
  computeNewDataAfterUpdate
);

export const buildUpdateQuery = ({
  model,
  fragmentName,
  fragment,
}: {
  model: VulcanGraphqlModel;
  fragmentName?: string;
  fragment?: Fragment;
}) => {
  const { typeName } = model.graphql;
  const { finalFragment, finalFragmentName } = getModelFragment({
    model,
    fragment,
    fragmentName,
  });
  return gql`
    ${updateClientTemplate({ typeName, fragmentName: finalFragmentName })}
    ${finalFragment}
  `;
};

// Options of the hook
interface UseUpdateOptions<TModel = any>
  extends VulcanMutationHookOptions,
  Partial<UpdateVariables<TModel>> { }
// Function returned by the hook
interface UpdateFuncResult<TModel = any, TData = any> /*
  extends UseMutationState<TData>*/ {
  document: TModel; // shortcut to get the document
}
type UpdateFunc<TData = any> = (
  args: UpdateVariables<TData>
) => Promise<UpdateFuncResult<TData>>;
// Result of the hook itself
type UseUpdateResult<T = any> = [UpdateFunc<T>, UseMutationState<T>]; // return the usual useMutation result, but with an abstracted creation function

/**
 * const [updateFoo] = useUpdate({model: Foo})
 * ...
 * await updateFoo({input: { id: "1234", data: myNewFoo }})
 */
export const useUpdate = <TModel = any>(
  options: UseUpdateOptions
): UseUpdateResult<TModel> => {
  const {
    model,
    fragment = model.graphql.defaultFragment,
    fragmentName = model.graphql.defaultFragmentName,
    mutationOptions = {},
  } = options;

  const { typeName } = model.graphql;

  const query = buildUpdateQuery({ model, fragmentName, fragment });

  const resolverName = `update${typeName}`;

  const [updateState, updateFunc] = useMutation(query/*, {
    // see https://www.apollographql.com/docs/react/features/error-handling/#error-policies
    errorPolicy: "all",
    update: multiQueryUpdaterAfterUpdate({
      model,
      fragment,
      fragmentName,
      resolverName,
    }),
    ...mutationOptions,
  }*/);

  const extendedUpdateFunc = async (variables: UpdateVariables<TModel>) => {
    const executionResult = await updateFunc({
      variables,
      /*: {
        ...computeQueryVariables(options, variables),
      },*/
    });
    const { data } = executionResult;
    return { ...executionResult, document: data?.[resolverName]?.data };
  };
  return [extendedUpdateFunc, updateState];
};
