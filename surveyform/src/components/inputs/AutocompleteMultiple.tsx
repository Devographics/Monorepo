"use client";

/*

Problem: because we store project IDs, when we load previously filled in values such
as "vue_js" we don't have the corresponding "clean" label ("Vue.js")

Solution: whenver a user picks a project to add as a response, also store the full
object (including label) to localStorage for future lookup.

TODO: if localStorage lookup fails, ideally we should then do a server request to
populate localStorage cache; but we don't currently do it

*/
/**
 * NOTE: currently we don't load react-boostrap css
 */
import { AsyncTypeahead } from "react-bootstrap-typeahead"; // ES2015
import { useState } from "react";
import { Alert } from "~/components/ui/Alert";
import { FormItem } from "~/components/form/FormItem";
import { FormInputProps } from "~/components/form/typings";
import { Loading } from "~/components/ui/Loading";
import { useLocalStorage } from "~/lib/hooks";
import uniqBy from "lodash/uniqBy";

export interface AutocompleteMultipleProps extends FormInputProps {
  // note: we pass this as prop to make it easy to switch
  // the component to a different data source if needed
  loadDataHook: any;
}

export const AutocompleteMultiple = (props: AutocompleteMultipleProps) => {
  const { updateCurrentValues, path, value: value_, loadDataHook } = props;

  // store a list of projects locally
  const [loadedProjects, setLoadedProjects] = useLocalStorage(
    "loadedProjects",
    []
  );

  const value = value_ as string[];

  const [query, setQuery] = useState<string | undefined>();

  // note: will not load anything unless query is defined
  const result = loadDataHook({ query });
  const { projects, error, loading } = result;

  // instead of making extra server request, look in localStorage cache
  const findProject = (id) =>
    loadedProjects.find((p) => p.id === id) || { id, label: id };

  const selectedItems = value ? value.map(findProject) : [];

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
        onChange={(selected: Array<{ id: string; label: string }>) => {
          const selectedIds = selected.map(({ id }) => id);
          updateCurrentValues({ [path]: selectedIds });
          // whenever user picks project, also add it to localStorage if it's not already theree
          const newProjects = uniqBy([...loadedProjects, ...selected], "id");
          setLoadedProjects(newProjects);
        }}
        options={projects}
        id={path}
        // passing id doesn't seem to work, we need input props
        inputProps={{ id: path }}
        onSearch={(queryString) => {
          setQuery(queryString);
        }}
        isLoading={loading}
        selected={selectedItems}
      />
      {loading && <Loading />}
    </FormItem>
  );
};

export default AutocompleteMultiple;
