import { modifierToData, dataToModifier } from "./validation";
import { runCallbacks } from "@vulcanjs/core";

import cloneDeep from "lodash/cloneDeep.js";
import isEmpty from "lodash/isEmpty.js";
import { VulcanDocument } from "@vulcanjs/schema";
import { restrictViewableFields } from "@vulcanjs/permissions";
import {
  getSelector,
  performMutationCheck,
  UpdateMutatorProperties,
  validateMutationData,
} from "./helpers";
import type { VulcanCrudModelServer } from "../typings";
import type { UpdateInput } from "../../typings";

interface UpdateMutatorCommonInput {
  model: VulcanCrudModelServer;
  /**
   * Using a "set" syntax
   * @deprecated
   */
  set?: Object;
  /**
   * Using an "unset" syntax
   * @deprecated
   */
  unset?: Object;
  /**
   * User that triggered the update request
   * Set to null only if the update request is triggered by the app itself
   * Example where you can set it to null or undefined: seeding data
   */
  currentUser?: any;
  /**
   * Should validate the data
   *
   * NEVER SET IT TO FALSE if the input comes from an user request!
   * @default true
   */
  validate?: boolean;
  /**
   * Set asAdmin to true when the update is controlled by the application
   * Example: seeding data
   *
   * NEVER SET IT TO TRUE if the input comes from an user request!
   * @default false
   */
  asAdmin?: boolean;
  /**
   * @deprecated 0.6 Pass only current user instead of the full graphql context
   */
  context?: any;
}

interface DataIdInput {
  dataId: string;
  data: VulcanDocument; // you must pass data at the root in this case
  // do not use the other fields to avoid ambiguity
  selector?: undefined;
  input?: undefined;
}
interface SelectorInput {
  /**
   * Selector must be in the connector format
   * Eg a Mongo selector
   * @deprecated Use input or dataId instead
   */
  selector: Object;
  data: VulcanDocument; // you must pass data at the root in this case
  // do not use the other fields to avoid ambiguity
  dataId?: undefined;
  input?: undefined;
}
interface VulcanInput {
  /**
   * Vulcan input
   *
   * Data represents the fields to update:
   * - id will be used to find the right document (you cannot update the id of a document)
   * - Fields that are not listed are left untouched
   * - Fields with value "null" will be unset from the document
   * - Fields with a non-null value will be updated
   *
   * @example { data: { id: 42, fieldToUpdate: "bar", fieldToRemove: null}}
   */
  input: UpdateInput<VulcanDocument>;
  dataId?: undefined;
  selector?: undefined;
  data?: undefined; // data are passed through the input in this case
}
export type UpdateMutatorInput = UpdateMutatorCommonInput &
  (DataIdInput | VulcanInput | SelectorInput);

/*

Update
Accepts a document reference by id, or Vulcan input

Using a Mongo selector directly is deprecated, use an input instead.

In charge of running the callbacks of the collection

*/
export const updateMutator = async <TModel extends VulcanDocument>({
  model,
  dataId: dataIdFromArgs,
  selector: selectorFromArgs,
  input,
  data: dataFromRoot,
  set: setFromArgs = {},
  unset = {},
  currentUser,
  validate,
  asAdmin,
  context = {},
}: UpdateMutatorInput): Promise<{ data: TModel }> => {
  const { name } = model;
  const mutatorName = "update";
  const { schema } = model;
  let data;
  if (input) {
    data = cloneDeep(input.data); // normal case when using the useUpdate hook/default update resolver
  } else {
    // passing data directly (eg when calling the mutator manually)
    data = cloneDeep(dataFromRoot);
    // same but with set/unset modifiers
    if (!data) data = modifierToData({ $set: setFromArgs, $unset: unset });
  }

  // get currentUser from context if possible
  if (!currentUser && context.currentUser) {
    currentUser = context.currentUser;
  }

  // get Mongo selector from the right input
  const dataId = dataIdFromArgs || input?.id || data?._id;
  const selector = await getSelector({
    dataId,
    selector: selectorFromArgs,
    input,
    context,
    model,
  });
  // this shouldn't be reachable
  if (isEmpty(selector)) {
    throw new Error(
      "Selector cannot be empty, please give an id or a proper input"
    );
  }

  /**
   * NOTE: in Vulcan Meteor, we used to get the connector from the GraphQL context
   * The idea was to rely on DataLoader for optimization. However, this is not needed in a mutator,
   * because only top level resolver may suffer from the N+1 problem and need a DataLoader/DataSource
   *
   * Using the model connector directly allows us to use mutators outside of graphql
   */
  const connector = model.crud.connector; //getModelConnector(context, model);
  if (!connector)
    throw new Error(
      `Model ${model.name} has no GraphQL connector. Cannot update a document for this model.`
    );
  // get original document from database or arguments
  const foundCurrentDocument = await connector.findOne(selector);

  /* Authorization */
  performMutationCheck({
    user: currentUser,
    document: foundCurrentDocument,
    model,
    operationName: "update",
    asAdmin,
  });
  // PerformMutationCheck will already check that the document has been found, we can cast safely
  let currentDocument = foundCurrentDocument as TModel;

  /*

  Properties

  */
  const properties: UpdateMutatorProperties = {
    data,
    originalData: cloneDeep(data),
    originalDocument: currentDocument,
    document: currentDocument,
    currentUser,
    model,
    schema,
    // legacy, only current-user will be used
    context,
  };

  /* Validation */
  if (validate) {
    await validateMutationData({
      model,
      data,
      originalDocument: currentDocument,
      mutatorName,
      currentUser,
      properties,
    });
  }

  /*

  Run field onUpdate callbacks

  */
  for (let fieldName of Object.keys(schema)) {
    let autoValue;
    const onUpdate = schema[fieldName].onUpdate;

    if (onUpdate) {
      autoValue = await onUpdate(properties); // eslint-disable-line no-await-in-loop
    }
    if (typeof autoValue !== "undefined") {
      data[fieldName] = autoValue;
    }
  }

  /* Before */
  data = await runCallbacks({
    hookName: `${name}.${mutatorName}.before`,
    callbacks: model.crud?.callbacks?.[mutatorName]?.before || [],
    iterator: data,
    args: [properties],
  });

  // update connector requires a modifier, so get it from data
  const modifier = dataToModifier(data);

  // remove empty modifiers
  if (isEmpty(modifier.$set)) {
    delete modifier.$set;
  }
  if (isEmpty(modifier.$unset)) {
    delete modifier.$unset;
  }

  /*

  DB Operation

  */
  let document;
  if (!isEmpty(modifier)) {
    // update document
    // and get fresh copy of document from db
    document = await connector.update(selector, modifier, {
      removeEmptyStrings: false,
    });

    // TODO: add support for caching by other indexes to Dataloader
    // https://github.com/VulcanJS/Vulcan/issues/2000
    // clear cache if needed
    // if (selector.documentId && collection.loader) {
    //   collection.loader.clear(selector.documentId);
    // }
  }

  /* After */
  document = await runCallbacks({
    hookName: `${name}.${mutatorName}.after`,
    callbacks: model.crud?.callbacks?.[mutatorName]?.after || [],
    iterator: document,
    args: [properties],
  });

  /* Async side effects, mutation won't wait for them to return. Use for analytics for instance */
  runCallbacks({
    hookName: `${name.toLowerCase()}.${mutatorName}.async`,
    callbacks: model.crud?.callbacks?.[mutatorName]?.async || [],
    args: [properties],
  });

  // filter out non readable fields if appliable
  if (!asAdmin) {
    document = restrictViewableFields(currentUser, model, document) as TModel;
  }

  return { data: document };
};
