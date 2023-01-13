import get from "lodash/get.js";
import { autocompleteQueryTemplate, fieldDynamicQueryTemplate } from "./autocompleteGraphql";


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
    labelsQueryResolverName: string;
    autocompleteQueryResolverName: string;
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
    labelsQueryResolverName,
    autocompleteQueryResolverName,
    fragmentName,
    valuePropertyName = "_id",
    multi,
  } = options;

  // if field stores an array, use multi autocomplete
  const isMultiple = multi || field.type === Array;

  const queryProps = {
    labelsQueryResolverName,
    autocompleteQueryResolverName,
    autocompletePropertyName,
    valuePropertyName,
    fragmentName,
  };

  // TODO: instead, create new REST endpoints that implement these queries
  // and encapsulate the underlying graphql logic

  // define query to load extra data for input values
  // to load only some items based on a key
  const dynamicQuery = () => {
    return fieldDynamicQueryTemplate(queryProps);
  };

  // query to load autocomplete suggestions
  const autocompleteQuery = () => {
    return autocompleteQueryTemplate(queryProps);
  };

  // define a function that takes the options returned by the queries
  // and transforms them into { value, label } pairs.
  // note: this is used both when loading autocomplete options, 
  // and loading item labels
  const optionsFunction = (props, type) => {
    const resolverName =
      type === "autocomplete"
        ? autocompleteQueryResolverName
        : labelsQueryResolverName;
    return get(props, `data.${resolverName}.results`, []).map((document) => ({
      ...document,
      value: document[valuePropertyName],
      label: document[autocompletePropertyName],
    }));
  };

  const acField = {
    dynamicQuery,
    // TODO: was it used?
    //staticQuery,
    query: dynamicQuery, // backwards-compatibility TODO: is it needed?
    autocompleteQuery,
    queryWaitsForValue: true,
    options: optionsFunction,
    autocompleteOptions: options,
    input: isMultiple ? "multiautocomplete" : "autocomplete",
    ...field, // add field last to allow manual override of properties in field definition
  };

  return acField;
};
