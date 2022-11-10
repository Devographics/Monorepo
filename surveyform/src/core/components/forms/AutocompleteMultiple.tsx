/**
 *
 * // Copied for bootstrap package
 * // TODO: find a more generic implementation
 *
 * Ideally for such a rich component we should also expose
 * hooks and internal logic so users can build their own
 * 
 * 
 * NOTE: currently we don't load react-boostrap css
 */
 import { AsyncTypeahead } from "react-bootstrap-typeahead"; // ES2015
 import React, { useEffect, useState } from "react";
 // We don't auto-expand queries in Vulcan NPM, since we don't use the registry pattern
 // anymore. Instead, provide the right fragments directly, using composition with string templates.
 //import { expandQueryFragments } from "meteor/vulcan:core";
 import { useLazyQuery } from "@apollo/client";
 import gql from "graphql-tag";
 import { useVulcanComponents } from "@vulcanjs/react-ui";
 import type { FormInputProps } from "@vulcanjs/react-ui";
 import { useFormContext } from "@vulcanjs/react-ui";
 
 export interface AutocompleteMultipleProps extends FormInputProps { }
 export const AutocompleteMultiple = (props: AutocompleteMultipleProps) => {
   // TODO: some props are now comming from the context
   const {
     queryData,
     //updateCurrentValues,
     refFunction,
     path,
     inputProperties = {},
     itemProperties = {},
     autocompleteQuery,
     optionsFunction,
   } = props;
 
   const { updateCurrentValues } = useFormContext();
 
   const Components = useVulcanComponents();
   // MergeWithComponents should be handled at the Form level
   // by creating a new VulcanComponents context that merges default components
   // and components passed via props
   //const Components = mergeWithComponents(formComponents);
 
   const { value, label } = inputProperties;
 
   // store current autocomplete query string in local component state
   const [queryString, setQueryString] = useState<string | undefined>();
 
   // get component's autocomplete query and use it to load autocomplete suggestions
   // note: we use useLazyQuery because
   // we don't want to trigger the query until the user has actually typed in something
   const [loadAutocompleteOptions, { loading, error, data }] = useLazyQuery(
     gql(/*expandQueryFragments(*/ autocompleteQuery() /*)*/),
     {
       variables: { queryString },
     }
   );
 
   // apply options function to data to get suggestions in { value, label } pairs
   const autocompleteOptions = data && optionsFunction({ data });
 
   // apply same function to loaded data; filter by current value to avoid displaying any
   // extra unwanted items if field-level data loading loaded too many items
   const selectedItems =
     queryData &&
     optionsFunction({ data: queryData }).filter((d) =>
       (value as Array<any>).includes(d.value)
     );
 
   // console.log(queryData)
   // console.log(queryData && optionsFunction({ data: queryData }));
   // console.log(value)
   // console.log(selectedItems)
 
   return (
     <Components.FormItem
       {...props} /*path={path} label={label} {...itemProperties}*/
       {...itemProperties}
       name={path}
       noteIntlId="tools.best_of_js_projects.note"
     >
       {/** Inspired by "FormErrors" */}
       {error && error.message && <Components.Alert className="flash-message" variant="danger">{error.message}</Components.Alert>}
       {/** @ts-ignore */}
       <AsyncTypeahead
         {...inputProperties}
         multiple
         onChange={(selected) => {
           const selectedIds = selected.map(
             // @ts-ignore Typing is wrong for some reason
             ({ value }) => value
           );
           updateCurrentValues({ [path]: selectedIds });
         }}
         options={autocompleteOptions}
         id={path}
         // passing id doesn't seem to work, we need input props
         inputProps={{ id: path }}
         ref={refFunction}
         onSearch={(queryString) => {
           setQueryString(queryString);
           loadAutocompleteOptions();
         }}
         isLoading={loading}
         selected={selectedItems}
       />
     </Components.FormItem>
   );
 };
 
 //registerComponent("FormComponentMultiAutocomplete", MultiAutocomplete);
 
 export default AutocompleteMultiple