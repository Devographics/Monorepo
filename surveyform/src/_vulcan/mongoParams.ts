/**
 * Converts Vulcan selector and options to Mongo parameters (selector, fields)
 */
import uniq from "lodash/uniq.js";
import isEmpty from "lodash/isEmpty.js";
// It leads to annoying issues with Jest
//import escapeStringRegexp from "escape-string-regexp";
function escapeStringRegexp(string) {
  if (typeof string !== "string") {
    throw new TypeError("Expected a string");
  }

  // Escape characters with special meaning either inside or outside character sets.
  // Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
  return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
import merge from "lodash/merge.js";
import { isEmptyOrUndefined } from "@vulcanjs/utils";
import { VulcanModel } from "@vulcanjs/model";
// TODO: handle both mongo and mongo
import { FilterableInput } from "@vulcanjs/crud";
import { VulcanCrudModelServer } from "@vulcanjs/crud/server";

// import { getSetting } from "./settings.js";
// convert GraphQL selector into Mongo-compatible selector
// TODO: add support for more than just documentId/_id and slug, potentially making conversion unnecessary
// see https://github.com/VulcanJS/Vulcan/issues/2000
/*
export const convertSelector = (selector) => {
  return selector;
};
*/
// Legacy support for documentId, not used anymore
/*
export const convertUniqueSelector = (selector) => {
  if (selector.documentId) {
    selector._id = selector.documentId;
    delete selector.documentId;
  }
  return selector;
};
*/
/*

Filtering

Note: we use $elemMatch syntax for consistency so that we can be sure that every mongo operator function
returns an object.

*/
const conversionTable = {
  _eq: "$eq",
  _gt: "$gt",
  _gte: "$gte",
  _in: "$in",
  _lt: "$lt",
  _lte: "$lte",
  _neq: "$ne",
  _nin: "$nin",
  asc: 1,
  desc: -1,
  _is_null: (value) => ({ $exists: !value }),
  _is: (value) => ({ $elemMatch: { $eq: value } }),
  _contains: (value) => ({ $elemMatch: { $eq: value } }),
  _like: (value) => ({
    $regex: value,
    $options: "i",
  }),
};

// get all fields mentioned in an expression like [ { foo: { _gt: 2 } }, { bar: { _eq : 3 } } ]
const getExpressionFieldNames = (expressionArray) => {
  return expressionArray.map((exp) => {
    const [fieldName] = Object.keys(exp);
    return fieldName;
  });
};

type QueryOptions = any
type FilterQuery = any
// TODO: should we use TModel or Vulcan document here??
interface FilterFunctionOutput {
  selector: any,//FilterQuery<any>;
  options: any, //QueryOptions;
  filteredFields: Array<string>;
}
export const filterFunction = async (
  model: VulcanModel,
  input: FilterableInput<any>,
  context?: any
): Promise<FilterFunctionOutput> => {
  // eslint-disable-next-line no-unused-vars
  const { filter, limit, sort, search, /*filterArguments,*/ offset, id } =
    input;
  let selector: /*FilterQuery<any>*/ any = {};
  let options: QueryOptions = {
    sort: {},
  }; // TODO: check if FindOneOptions is the right type for this
  let filteredFields: Array<string> = [];

  const schema = model.schema;

  /*
  
    Convert GraphQL expression into MongoDB expression, for example
  
    { fieldName: { operator: value } }
  
    { title: { _in: ["foo", "bar"] } }
  
    to:
  
    { title: { $in: ["foo", "bar"] } }
  
    or (intl fields):
  
    { title_intl.value: { $in: ["foo", "bar"] } }
  
    */
  const convertExpression = (fieldExpression) => {
    const [fieldName] = Object.keys(fieldExpression);
    const operators = Object.keys(fieldExpression[fieldName]);
    const mongoExpression = {};
    operators.forEach((operator) => {
      const value = fieldExpression[fieldName][operator];
      if (isEmptyOrUndefined(value)) {
        throw new Error(
          `Detected empty filter value for field “${fieldName}” with operator “${operator}”`
        );
      }
      const mongoOperator = conversionTable[operator];
      if (!mongoOperator) {
        throw new Error(
          `Operator ${operator} is not valid. Possible operators are: ${Object.keys(
            conversionTable
          )}`
        );
      }
      const mongoObject =
        typeof mongoOperator === "function"
          ? mongoOperator(value)
          : { [mongoOperator]: value };
      merge(mongoExpression, mongoObject);
    });
    const isIntl = schema[fieldName].intl;
    const mongoFieldName = isIntl ? `${fieldName}_intl.value` : fieldName;
    return { [mongoFieldName]: mongoExpression };
  };

  // id
  if (id) {
    selector = { _id: id };
  }

  // filter
  if (!isEmpty(filter) && filter) {
    // trick for TypeScript because isEmpty is not correctly typed
    Object.keys(filter).forEach((fieldName) => {
      switch (fieldName) {
        case "_and":
          filteredFields = filteredFields.concat(
            getExpressionFieldNames(filter._and)
          );
          // Bypass TypeScript check (_and is present if we reach this line)
          //
          // @ts-expect-error: Object is possibly 'undefined'.
          selector["$and"] = filter._and.map(convertExpression);
          break;

        case "_or":
          filteredFields = filteredFields.concat(
            getExpressionFieldNames(filter._or)
          );
          // @ts-expect-error: Object is possibly 'undefined'.
          selector["$or"] = filter._or.map(convertExpression);
          break;

        case "_not":
          filteredFields = filteredFields.concat(
            getExpressionFieldNames(filter._not)
          );
          // @ts-expect-error: Object is possibly 'undefined'.
          selector["$not"] = filter._not.map(convertExpression);
          break;

        case "search":
          break;

        default:
          // FIXME: typing is not really right, this function should only accept CrudServer models
          // but in the app we may pass it raw VulcanModel (if we don't need custom filters for instance)
          const customFilters = (model as VulcanCrudModelServer)?.crud
            ?.customFilters;
          const customFilter =
            customFilters && customFilters.find((f) => f.name === fieldName);
          if (customFilter) {
            // field is not actually a field, but a custom filter
            const filterArguments = filter[customFilter.name];
            // TODO: make this work with await
            const filterObject = customFilter.filter({
              input,
              context,
              filterArguments,
            });
            selector = merge({}, selector, filterObject.selector);
            options = merge({}, options, filterObject.options);
          } else {
            // regular field
            filteredFields.push(fieldName);
            selector = {
              ...selector,
              ...convertExpression({ [fieldName]: filter[fieldName] }),
            };
          }
          break;
      }
    });
  }

  // sort
  if (sort && !isEmpty(sort)) {
    options.sort = merge(
      {},
      options.sort,
      Object.keys(sort).reduce((sortRes, sortKey) => {
        const order = sort[sortKey];
        if (!order) {
          throw new Error(
            `Order not defined for key ${sortKey}. Possible operators: asc, desc.`
          );
        }
        const mongoOrder = conversionTable[order];
        return { ...sortRes, [sortKey]: mongoOrder };
      }, {})
    );
  } else {
    options.sort = { createdAt: -1 }; // reliable default order
  }

  // search
  if (search && !isEmpty(search)) {
    const searchQuery = escapeStringRegexp(search);
    const searchableFieldNames = Object.keys(schema).filter(
      // do not include intl fields here
      (fieldName) =>
        !fieldName.includes("_intl") && schema[fieldName].searchable
    );
    if (searchableFieldNames.length) {
      selector = {
        ...selector,
        $or: searchableFieldNames.map((fieldName) => {
          const isIntl = schema[fieldName].intl;
          return {
            [isIntl ? `${fieldName}_intl.value` : fieldName]: {
              $regex: searchQuery,
              $options: "i",
            },
          };
        }),
      };
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        `Warning: search argument is set but schema ${model.name} has no searchable field. Set "searchable: true" for at least one field to enable search.`
      );
    }
  }

  // limit
  const maxLimit = 1000; // getSetting("maxDocumentsPerRequest", 1000);
  options.limit = limit ? Math.min(limit, maxLimit) : maxLimit;

  // offest
  if (offset) {
    options.skip = offset;
  }

  // console.log('// collection');
  // console.log(collection.options.collectionName);
  // console.log('// input');
  // console.log(JSON.stringify(input, 2));
  // console.log('// selector');
  // console.log(JSON.stringify(selector, 2));
  // console.log('// options');
  // console.log(JSON.stringify(options, 2));
  // console.log('// filterFields');
  // console.log(uniq(filteredFields));

  return {
    selector,
    options,
    filteredFields: uniq(filteredFields),
  };
};
