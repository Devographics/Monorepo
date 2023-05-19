"use client";
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
import { useState } from "react";
// We don't auto-expand queries in Vulcan NPM, since we don't use the registry pattern
// anymore. Instead, provide the right fragments directly, using composition with string templates.
//import { expandQueryFragments } from "meteor/vulcan:core";
import gql from "graphql-tag";
import { Alert } from "~/components/ui/Alert";
import { FormItem } from "~/components/form/FormItem";
import useSWR from "swr";
import { FormInputProps } from "~/components/form/typings";

export interface AutocompleteMultipleProps extends FormInputProps {}

// TODO: move the autocomplete query creation logic to server
// @see https://swr.vercel.app/docs/arguments
const useAutocomplete = (autocompleteQuery, autocompleteVariables) =>
  useSWR<any>([autocompleteQuery, autocompleteVariables]);

export const AutocompleteMultiple = (props: AutocompleteMultipleProps) => {
  // TODO: some props are now comming from the context
  const {
    updateCurrentValues,
    // refFunction,
    path,
    value,
  } = props;

  const queryData = {};
  const autocompleteQuery = () => "";
  const optionsFunction = (a, b) => [{ id: "foo" }];

  // MergeWithComponents should be handled at the Form level
  // by creating a new VulcanComponents context that merges default components
  // and components passed via props
  //const Components = mergeWithComponents(formComponents);

  // store current autocomplete query string in local component state
  const [queryString, setQueryString] = useState<string | undefined>();

  // get component's autocomplete query and use it to load autocomplete suggestions
  // note: we use useLazyQuery because
  // we don't want to trigger the query until the user has actually typed in something
  const { data, error } = useAutocomplete(
    queryString &&
      //const [loadAutocompleteOptions, { loading, error, data }] = useLazyQuery(
      gql(/*expandQueryFragments(*/ autocompleteQuery() /*)*/),
    {
      queryString,
    }
  );
  const loading = !data && !error;

  // apply options function to data to get suggestions in { value, label } pairs
  const autocompleteOptions = data && optionsFunction({ data }, "autocomplete");

  // apply same function to loaded data; filter by current value to avoid displaying any
  // extra unwanted items if field-level data loading loaded too many items
  const selectedItems =
    queryData &&
    optionsFunction({ data: queryData }, "labels").filter((d) =>
      (value as Array<any>)?.includes(d.id)
    );

  return (
    <FormItem
      {...props}
      // noteIntlId="tools.best_of_js_projects.note"
    >
      {/** Inspired by "FormErrors" */}
      {error && error.message && (
        <Alert className="flash-message" variant="danger">
          {error.message}
        </Alert>
      )}
      {/** @ts-ignore */}
      <AsyncTypeahead
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
        // ref={refFunction}
        onSearch={(queryString) => {
          setQueryString(queryString);
        }}
        isLoading={loading}
        selected={selectedItems}
      />
    </FormItem>
  );
};

//registerComponent("FormComponentMultiAutocomplete", MultiAutocomplete);

export default AutocompleteMultiple;
