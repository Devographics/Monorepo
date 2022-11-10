import type { VulcanGraphqlFieldSchema } from "@vulcanjs/graphql";
import get from "lodash/get.js";

import { capitalize } from "@vulcanjs/utils";

export const fieldDynamicQueryName = ({ queryResolverName }) =>
  `FormComponentDynamic${capitalize(queryResolverName)}Query`;

/*

Field-specific data loading query template for a dynamic array of item IDs

(example: `categoriesIds` where $value is ['foo123', 'bar456'])

*/
export const fieldDynamicQueryTemplate = ({
  queryResolverName,
  autocompletePropertyName,
}) =>
  `query ${fieldDynamicQueryName({ queryResolverName })}($value: [String!]) {
    ${queryResolverName}(input: { 
      filter: {  _id: { _in: $value } },
      sort: { ${autocompletePropertyName}: asc }
    }){
      results{
        _id
        ${autocompletePropertyName}
      }
    }
  }
`;


export const autocompleteQueryName = ({
  queryResolverName,
}: {
  queryResolverName: string;
}) => `Autocomplete${capitalize(queryResolverName)}Query`;

/*

Query template for loading a list of autocomplete suggestions

*/
export const autocompleteQueryTemplate = ({
  queryResolverName,
  autocompletePropertyName,
}) => `
  query ${autocompleteQueryName({ queryResolverName })}($queryString: String) {
    ${queryResolverName}(
      input: {
        filter: {
          ${autocompletePropertyName}: { _like: $queryString }
        },
        limit: 20
      }
    ){
      results{
        _id
        ${autocompletePropertyName}
      }
    }
  }
`;


/**
 * Get multi resolver name for a relation field
 * @param field
 * @returns
 */
const getQueryResolverName = (field: VulcanGraphqlFieldSchema) => {
  //const isRelation = !!field.relation; // TODO: doesn't exist in our typings anymore|| field?.resolveAs?.relation;
  if (!field.relation)
    throw new Error(
      `Field is not defining any relation ${JSON.stringify(
        field
      )}. Please set a relation or specify the queryResolverName option for the makeAutocomplete decorator.`
    );
  if (!!field.relation) {
    const model = "model" in field.relation ? field.relation.model : null;
    if (!model)
      throw new Error(
        `Field relation expects "model" option to be set (instead of deprecated "typeName")`
      );
    return model.graphql.multiResolverName;
    /*
    const typeName = field.relation?.typeName;
    //get(field, "relation.typeName") || get(field, "resolveAs.typeName");
    const collection = getCollectionByTypeName(typeName);
    return get(collection, "options.multiResolverName");
    */
  } else {
    throw new Error(
      "Could not guess query resolver name, please specify a queryResolverName option for the makeAutocomplete decorator."
    );
  }
};
// note: the following decorator function is called both for autocomplete and autocompletemultiple
// We already have set simpl schema typings yet we have a weird error message
// @see https://github.com/microsoft/TypeScript/issues/5711
// @see https://forums.meteor.com/t/how-to-combine-typescript-and-simpleschema/28475
export const makeAutocomplete = (
  // TODO: for some reason this type messes up everything
  field: any, //VulcanGraphqlFieldSchema,
  options: {
    autocompletePropertyName: string;
    fragmentName?: string;
    /** Value of the select */
    valuePropertyName?: string;
    /** Is an array of values to autocomplete */
    multi?: boolean;
    /**
     * Will use "multi" query for the model as a default,
     * can be overriden using this option
     */
    queryResolverName?: string;
  }
) => {
  /*

  - queryResolverName: the name of the query resolver used to fetch the list of autocomplete suggestions
  - autocompletePropertyName: the name of the property used as the label for each item
  - fragmentName: the name of the fragment to use to fetch additional data besides autocompletePropertyName
  - valuePropertyName: the name of the property to return (defaults to `_id`)

  */
  const {
    autocompletePropertyName,
    fragmentName,
    valuePropertyName = "_id",
    multi,
  } = options;

  // Already caught by typeScript statically
  //if (!autocompletePropertyName) {
  //  throw new Error(
  //    "makeAutocomplete decorator is missing an autocompletePropertyName option."
  //  );
  //}

  // if field stores an array, use multi autocomplete
  const isMultiple = multi || field.type === Array;

  const queryResolverName =
    options.queryResolverName || getQueryResolverName(field);
  const queryProps = {
    queryResolverName,
    autocompletePropertyName,
    valuePropertyName,
    fragmentName,
  };

  // define query to load extra data for input values

  // to load only some items based on a key
  const dynamicQuery = () => {
    return fieldDynamicQueryTemplate(queryProps);
  };

  // to load all possible items
  /*
  TODO: did not seem to be used at all, this function was not imported
  const staticQuery = () => {
    return fieldStaticQueryTemplate(queryProps);
  };
  */

  // query to load autocomplete suggestions
  const autocompleteQuery = () => {
    return autocompleteQueryTemplate(queryProps);
  };

  // define a function that takes the options returned by the queries
  // and transforms them into { value, label } pairs.
  const optionsFunction = (props) => {
    const queryResolverName =
      options.queryResolverName || getQueryResolverName(field);

    return get(props, `data.${queryResolverName}.results`, []).map(
      (document) => ({
        ...document,
        value: document[valuePropertyName],
        label: document[autocompletePropertyName],
      })
    );
  };

  const acField = {
    dynamicQuery,
    // TODO: was it used?
    //staticQuery,
    query: dynamicQuery, // backwards-compatibility TODO: is it needed?
    autocompleteQuery,
    queryWaitsForValue: true,
    options: optionsFunction,
    input: isMultiple ? "multiautocomplete" : "autocomplete",
    ...field, // add field last to allow manual override of properties in field definition
  };

  return acField;
};
