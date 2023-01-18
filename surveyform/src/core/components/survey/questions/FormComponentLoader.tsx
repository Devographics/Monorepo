/**
 * Changes from Vulcan Meteor:
 * - query is not expanded: you need to pass the full query with fragments already
 */
import React from "react";
// @see packages/vulcan-lib/lib/modules/fragments.js in Vulcan
// should we reenable this?
// import { expandQueryFragments } from "meteor/vulcan:core";
import gql from "graphql-tag";
import isEmpty from "lodash/isEmpty.js";
import { Loading } from "../../ui/Loading";
import { graphqlFetcher } from "~/core/utils/graphqlQuery";
import useSWR from "swr";

export interface FormComponentLoaderProps {
  query: string | (({ value }) => string);
  children: React.ReactNode;
  options: any;
  value: any;
  /** Run the query only when value is not empty */
  queryWaitsForValue?: boolean;
}

const useFieldData = (fieldQuery, fieldVariables) =>
  useSWR<any>([fieldQuery, fieldVariables], graphqlFetcher);
export const FormComponentLoader = (props: FormComponentLoaderProps) => {
  const { query, children, options, value, queryWaitsForValue } = props;

  // if query is a function, execute it
  const queryText = typeof query === "function" ? query({ value }) : query;

  const valueIsEmpty =
    isEmpty(value) || (Array.isArray(value) && value.length) === 0;

  const shouldGetData = !(queryWaitsForValue && valueIsEmpty);
  const { error, data } = useFieldData(
    shouldGetData && gql(queryText),
    { value }
    // gql(expandQueryFragments(queryText))
  );
  const loading = !error && !data;

  if (error) {
    throw new Error(error.toString());
  }

  if (loading) {
    return (
      <div className="form-component-loader">
        <Loading />
      </div>
    );
  }

  // pass newly loaded data (and options if needed) to child component
  const extraProps: {
    data: any;
    queryData: any;
    queryError: any;
    loading: boolean;
    optionsFunction?: Function;
    options?: Array<any>;
  } = { data, queryData: data, queryError: error, loading };
  if (typeof options === "function") {
    extraProps.optionsFunction = options;
    extraProps.options = options.call({}, { ...props, data });
  }
  if (!React.isValidElement(children)) {
    throw new Error(
      "Children of FormComponentLoader must be a React element, got " + children
    );
  }
  const fci = React.cloneElement(children, extraProps);

  return <div className="form-component-loader">{fci}</div>;
};

FormComponentLoader.propTypes = {};
