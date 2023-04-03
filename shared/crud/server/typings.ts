import type { VulcanModel } from "@vulcanjs/model";
import type { Connector } from "./connector";
import type { VulcanDocument, VulcanSchema } from "@vulcanjs/schema";

// Callbacks typings
type MaybeAsync<T> = T | Promise<T>;
interface CreateProperties {
  data: any;
  originalData: VulcanDocument;
  currentUser: any;
  model: VulcanModel;
  schema: VulcanSchema;
  /** @deprecated Get currentUser directly */
  context: any; //ContextWithUser;
}
type CreateBeforeCb = (
  data: VulcanDocument,
  properties: CreateProperties
) => MaybeAsync<VulcanDocument>;
type CreateAfterCb = (
  data: VulcanDocument,
  properties: CreateProperties
) => MaybeAsync<VulcanDocument>;
type CreateAsyncCb = (
  data: any, // TODO: not sure what happens when no iterator is provided in runCallbacks
  properties: CreateProperties
) => MaybeAsync<void>;
type ValidationError = any;

type ValidateCb = (
  validationErrors: Array<ValidationError>,
  properties: any
) => MaybeAsync<Array<ValidationError>>;

// type CreateCallback = (document: VulcanDocument) => VulcanDocument | Promise<VulcanDocument>
export interface MutationCallbackDefinitions {
  create?: {
    /**
     * @example packages/graphql/server/resolvers/mutators.ts
     */
    validate?: Array<ValidateCb>;
    before?: Array<CreateBeforeCb>;
    after?: Array<CreateAfterCb>;
    async?: Array<Function>;
  };
  update?: {
    validate?: Array<ValidateCb>;
    before?: Array<Function>;
    after?: Array<Function>;
    async?: Array<Function>;
  };
  delete?: {
    validate?: Array<ValidateCb>;
    before?: Array<Function>;
    after?: Array<Function>;
    async?: Array<Function>;
  };
}

// SCHEMA TYPINGS
// Custom resolver

// MODEL TYPINGS
// Those typings extends the raw model/schema system
// information relevant for server and client
interface CrudModel { }
// Client only model fields
// interface GraphqlClientModel extends GraphqlModel {}

// Server only model fields
interface CrudModelServer extends CrudModel {
  /**
   * Connector tied to a model
   *
   * NOTE: since the connector itself depends on the model, you need
   * to define this value AFTER creating the model
   *
   * @example
   * const connector = ...
   * const model = ...
   * model.crud.connector = connector
   */
  connector?: Connector;
  callbacks?: MutationCallbackDefinitions;
  /**
   * See "Filtering" documentation
   * 
   * @experimental Only supports Mongo at the moment
   * The return type should match your Connector type
   * so a Mongo selector/mongo options for example
   * 
   * @example {
      name: '_withRating',
      arguments: 'average: Int',
      filter: ({ input, context, filterArguments }) => {
        const { average } = filterArguments;
        const { Reviews } = context;
        // get all movies that have an average review score of X stars 
        const xStarReviewsMoviesIds = getMoviesByScore(average);
        return {
          selector: { _id: {$in: xStarReviewsMoviesIds } },
          options: {}
        }
      };
    }
   */
  customFilters?: Array<{
    /**
     * Preferably start with a underscore
     * Must not be a name already used (avoid _in, _eq etc.)
     * @example _withRatings
     */
    name: string;
    /**
     * GraphqQL arugments
     * @example "average: Int"
     */
    arguments?: string;
    filter: (args: { input: any; context: any; filterArguments: any }) => any;
  }>;
}

// Extended model with extended schema
// @server-only
export interface VulcanCrudModelServer<TSchema = any>
  extends VulcanModel<TSchema> /* VulcanCrudSchemaServer */ {
  crud: CrudModelServer;
}
// SCHEMA TYPINGS
// Custom resolver

/**
 * @example       field: {
        type: String,
        optional: true,
        canRead: ["admins"],
        resolveAs: {
          fieldName: "resolvedField",
          type: "Bar",
          resolver: async (root, args, context) => {
            return `Variable value is ${args?.variable}`;
          },
          arguments: "variable: String",
          description: "Some field",
          typeName: "String",
          addOriginalField: true,
        },
      }
 */

// Mutations
export type DefaultMutatorName = "create" | "update" | "delete";

// Wrap input type, so the input is in the "input" field as an object
// Mutation/Hooks typings
interface CommonInput {
  contextName?: string;
}
export interface CreateInput<TModel = any> extends CommonInput {
  data: TModel;
}
export interface CreateVariables<TModel = any> {
  input: CreateInput<TModel>;
}
export interface UpdateInput<TModel> extends CommonInput, FilterableInput {
  data: TModel;
  id?: string;
}
export interface UpdateVariables<TModel = any> {
  input: UpdateInput<TModel>;
}

export interface DeleteInput extends CommonInput, FilterableInput {
  id?: string;
}
export interface DeleteVariables {
  input: DeleteInput;
}

// Filtering and selectors
type VulcanSelectorSortOption = "asc" | "desc";

/**
 * { foo:2}
 * { foo: { _gt: 3}}
 */

type FieldSelector<TModel = any> = {
  [key in keyof TModel]?: ConditionSelector; // NOTE: we cannot yet pass native values | string | number | boolean | null | ;
} & { [key in PossibleOperators]?: never };

type ConditionSelector = {
  //[key in VulcanSelectorCondition]?: VulcanSelector<TModel>;
  _eq?: any;
  _gt?: string | number;
  _gte?: string | number;
  _in?: Array<any>;
  _lt?: string | number;
  _lte?: string | number;
  _neq?: any;
  _nin?: Array<any>;
  _is_null?: any;
  _is?: any;
  _contains?: any;
  _like?: string;
};
type PossibleConditions = keyof ConditionSelector;

type PossibleOperators = "_and" | "_or" | "_not";
type OperatorSelector<TModel = any> = {
  [key in PossibleOperators]?: Array<FieldSelector<TModel>>; // Array<VulcanSelector<TModel>>; //VulcanInnerSelector<TModel>>;
};

// Field selector = { foo: 2} where foo is part of the model
//type VulcanFieldSelector<TModel = any> = {
//  [
//    fieldName: string /*in Exclude<
//    keyof TModel,
//    VulcanPossibleConditions | VulcanPossibleOperators // field cannot be _gte, _and, etc.
//  >*/
//  ]: VulcanInnerSelector<TModel> | string | number | null | boolean; // can be a primirive value as well
//} & { [key in VulcanPossibleConditions]?: never } &
//  { [key in VulcanPossibleOperators]?: never };

// Inner selector = field selector, operators and also conditions
// type VulcanInnerSelector<TModel = any> = VulcanSelector<TModel> &
//   VulcanConditionSelector; // nested selector also allow conditions { foobar: { _gt: 2}}

/**
 * Combination of field selectors, conditions and operators
 * { _and: [{size:2}, {name: "hello"}], bar: 3}
 */

export type VulcanSelector<TModel = any> =
  | FieldSelector<TModel>
  | OperatorSelector<TModel>;

// Minimum API for filter function
export interface FilterableInput<TModel = any> {
  id?: string;
  filter?: VulcanSelector<TModel>;
  sort?: { [fieldName in keyof TModel]?: VulcanSelectorSortOption };
  limit?: number;
  search?: string;
  offset?: number;
}

// Not used yet
//export interface VulcanCrudModel
//  extends VulcanModel<{} /* VulcanCrudSchema */> {
//  // Nothing yet
//  //crud: CrudModel;
// }
