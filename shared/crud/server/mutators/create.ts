import cloneDeep from "lodash/cloneDeep.js";
import { VulcanDocument } from "@vulcanjs/schema";
import { restrictViewableFields } from "@vulcanjs/permissions";
import {
  CreateMutatorProperties,
  performMutationCheck,
  validateMutationData,
} from "./helpers";
import { VulcanCrudModelServer } from "../typings";

interface CreateMutatorInput {
  model: VulcanCrudModelServer;
  document?: VulcanDocument;
  /**
   * Document you want to create
   */
  data: VulcanDocument;
  /**
   * Optional GraphQL context. The "currentUser" field will be used to check permissions.
   *
   * @deprecated Prefer passing currentUser directly
   **/
  context?: any;
  /**
   * Current user, needed for permission check
   */
  currentUser?: any;
  /**
   * Bypass permission checks.
   *
   * Usually useful when writing scripts outside of a GraphQL mutation, eg for seed.
   *
   * Use carefully.
   */
  asAdmin?: boolean; // bypass security checks like field restriction
  /**
   * Bypass document validation.
   *
   * Use carefully.
   */
  validate?: boolean;
}
/**
 * Create a new object
 *
 * Will run permissions check, and callbacks tied to a model
 */
export const createMutator = async <TModel extends VulcanDocument>({
  model,
  data: originalData,
  currentUser,
  validate,
  asAdmin,
  context = {},
}: CreateMutatorInput): Promise<{ data: TModel }> => {
  // we don't want to modify the original document
  let data: Partial<TModel> = cloneDeep(originalData) as TModel;

  const { schema } = model;

  // get currentUser from graphql context if provided
  if (!currentUser && context.currentUser) {
    currentUser = context.currentUser;
  }

  const properties: CreateMutatorProperties = {
    document: data,
    data,
    originalData,
    currentUser,
    model,
    schema,
    // legacy, only currentUser will be used
    context,
  };

  const { name } = model; //model.graphql;
  const mutatorName = "create";

  /* Authorization */
  performMutationCheck({
    user: currentUser,
    document: data,
    model,
    operationName: "create",
    asAdmin,
  });

  /* Validation */
  if (validate) {
    await validateMutationData({
      model,
      data,
      mutatorName,
      currentUser,
      properties,
    });
  }

  /* If userId field is missing in the document, add it if user is logged in */
  if (!data.userId && schema.hasOwnProperty("userId") && currentUser) {
    data.userId = currentUser._id;
  }
  /* 

  TODO: do not rely on this pattern, create whatever needs to be created before updating

  
  Field callback onCreate

  note: cannot use forEach with async/await. 
  See https://stackoverflow.com/a/37576787/649299

  note: clone arguments in case callbacks modify them

  */
  for (let fieldName of Object.keys(schema)) {
    try {
      let autoValue;
      // TODO: run for nested
      const onCreate = schema[fieldName].onCreate;
      if (onCreate) {
        autoValue = await onCreate(properties); // eslint-disable-line no-await-in-loop
      }
      if (typeof autoValue !== "undefined") {
        data[fieldName as keyof TModel] = autoValue;
      }
    } catch (e) {
      console.log(`// Autovalue error on field ${fieldName}`);
      console.log(e);
    }
  }

  /* DB Operation */
  // TODO: do not rely on Vulcan connectors
  const connector = model.crud.connector;
  if (!connector)
    throw new Error(
      `Model ${model.name} has no connector. Cannot create a document.`
    );
  let document = await connector.create(data);

  if (!asAdmin) {
    document = restrictViewableFields(currentUser, model, document) as TModel;
  }
  return { data: document };
};
