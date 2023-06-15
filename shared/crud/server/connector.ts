import { VulcanDocument } from "@vulcanjs/schema";
import { FilterableInput } from "../typings";

/**
 * A database abstraction compatible with Vulcan
 */
export interface Connector<
  TModel extends VulcanDocument = any,
  /**
   * Type of Selector, in the Connector domain
   * => Mongo selector for mongo etc.
   * So connectors share the same main API, but selectors may have different shapes to fit the spécificities of the connector
   * The _filter function let's you convert generic Vulcan Input format into the connector specific selector format
   */
  TSelector = any,
  TOptions = any,
  /** Some code might need to access the raw collection
   *
   * /!\ It can't be typed at this point! You are responsible of checking the
   * type of the raw collection when you manipulate it
   *
   * Use case: automatically generating Mongoose data source when user provide no data source
   */
  TRawCollection = any
> {
  /**
   * Compute the relevant selectors
   */
  _filter: (
    input: FilterableInput<TModel>,
    context: any
  ) => Promise<{
    selector: TSelector; // VulcanSelector is the input, TSelector the output
    options: TOptions;
    filteredFields: Array<any>; // TODO: in defaultQueryResolvers we do filteredFields = Object.keys(selector), so what is this parameter?
  }>;
  // replaces collection.loader.load
  // @see https://github.com/GraphQLGuide/apollo-datasource-mongodb/#findonebyid
  findOneById: (_id: string | any) => Promise<TModel | null>;
  // replaces get
  findOne: (selector?: TSelector, options?: TOptions) => Promise<TModel | null>;
  /**
   * Find data in the database
   */
  find: (selector?: TSelector, options?: TOptions) => Promise<Array<TModel>>;
  count: (selector?: TSelector) => Promise<number>;
  // TODO: should we keep supporting loader.load and get? or
  // Mutations
  create: (data: Partial<TModel>) => Promise<TModel>;
  update: (
    selector: TSelector,
    modifier: Object,
    options?: { removeEmptyStrings: boolean }
  ) => Promise<TModel>;
  // Returns true (NOTE: this is a deleteMany operation, so it doesn't return the document but a success response)
  delete: (selector: TSelector) => Promise<true>;
  getRawCollection: () => TRawCollection;
}
