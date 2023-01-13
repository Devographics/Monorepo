import { capitalize } from "@vulcanjs/utils";
/*

Field-specific data loading query template for a dynamic array of item IDs

(example: `categoriesIds` where $value is ['foo123', 'bar456'])

*/
export const fieldDynamicQueryTemplate = ({
    labelsQueryResolverName,
    autocompletePropertyName,
}) =>
    `query FormComponentDynamic${capitalize(labelsQueryResolverName)}Query($value: [String!]) {
    ${labelsQueryResolverName}(input: { 
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

/*

Query template for loading a list of autocomplete suggestions

*/
export const autocompleteQueryTemplate = ({
    autocompleteQueryResolverName,
    autocompletePropertyName,
}) => `
  query Autocomplete${capitalize(autocompleteQueryResolverName)}Query($queryString: String) {
    ${autocompleteQueryResolverName}(
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