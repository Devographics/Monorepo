/*

FormContainer aka SmartForm

Changes compared to Vulcan Meteor:

- previously was named FormWrapper
- accepts a model instead of collection
- no queryFragmentName (resp. mutation name), instead you need to pass the fragment explicitely

Technically, this is a GraphqlSmartForm, while Form.tsx is the more
generic SmartForm, or a "ModelForm".


---

Generate the appropriate fragment for the current form, then
wrap the main Form component with the necessary HoCs while passing
them the fragment.

This component is itself wrapped with:

- withCurrentUser
- withApollo (used to access the Apollo client for form pre-population)

And wraps the Form component with:

- withNew

Or:

- withSingle
- withUpdate
- withDelete

(When wrapping with withSingle, withUpdate, and withDelete, a special Loader
component is also added to wait for withSingle's loading prop to be false)

*/
import React, { useRef } from "react";
// import // withCurrentUser,
// Utils,
// getFragment,
//"meteor/vulcan:core";
import gql from "graphql-tag";
import type { DocumentNode } from "graphql";

import getFormFragments from "../utils/formFragments";
// import { VulcanModel } from "@vulcanjs/model";
import { VulcanGraphqlModel, getFragmentName } from "@vulcanjs/graphql";
import type {
  CreateVariables,
  UpdateVariables,
  DeleteVariables,
} from "@vulcanjs/crud";
import { capitalize } from "@vulcanjs/utils";
import {
  useSingle,
  useCreate,
  useUpdate,
  useDelete,
} from "@devographics/react-hooks";
//import { FetchResult } from "@apollo/client";
// import { FormType } from "./typings";
import { debugVulcan } from "@vulcanjs/utils";
import { VulcanUser } from "@vulcanjs/permissions";
import { PassedDownFormProps } from "./Form/typings";
// Be careful to import from the Consumer!
import { useVulcanComponents } from "../../VulcanComponents/Consumer";
import { useVulcanCurrentUser } from "../../VulcanCurrentUser";
const debugForm = debugVulcan("form");

export interface FormContainerProps extends PassedDownFormProps {
  model: VulcanGraphqlModel;
  /** Document id for edition mode, will automatically fetch the document */
  documentId?: string;
  /** Slug (= human readable unique id) for edition mode, will automatically fetch the document */
  slug?: string;
  /**
   * List only those fields in the form
   */
  fields?: Array<string>;
  /**
   * List default fields + those additional fields as well
   */
  addFields?: Array<string>;
  /**
   * Force a currentUser, overriding the currentUser obtained
   * via Context
   *
   * If you use many forms in your app,
   * it might be better to set VulcanCurrentUserContext
   * at the top-level of your app
   * (eg in "pages/_app.js" for Next.js)
   */
  currentUser?: VulcanUser | null;
  loadingCurrentUser?: boolean;
}
export type SmartFormProps = FormContainerProps;

const useFragments = (
  props: Pick<
    FormContainerProps,
    | "mutationFragment"
    | "mutationFragmentName"
    | "queryFragment"
    | "queryFragmentName"
    // for auto generation
    | "model"
    | "fields"
    | "addFields"
  >,
  formType: "edit" | "new"
) => {
  // get fragment used to decide what data to load from the server to populate the form,
  // as well as what data to ask for as return value for the mutation
  // TODO: move out of the component
  //const getFragments = () => {
  let queryFragment: DocumentNode | undefined;
  let queryFragmentName: string | undefined;
  let mutationFragment: DocumentNode | undefined;
  let mutationFragmentName: string | undefined;

  // if queryFragment or mutationFragment props are specified, accept either fragment object or fragment string
  // TODO: not sure we actually need that, gApollo accepts fragments or string normally
  if (props.queryFragment) {
    if (typeof props.queryFragment === "string") {
      queryFragment = gql`
        ${props.queryFragment}
      `;
      if (!props.queryFragmentName)
        throw new Error(
          "When using a string queryFragment, queryFragmentName is mandatory"
        );
      queryFragmentName = props.queryFragmentName;
    } else {
      // DocumentNode
      queryFragment = props.queryFragment;
      // automatically compute the fragment name
      queryFragmentName =
        props.queryFragmentName || getFragmentName(props.queryFragment);
    }
  }
  if (props.mutationFragment) {
    if (typeof props.mutationFragment === "string") {
      mutationFragment = gql`
        ${props.mutationFragment}
      `;
      if (!props.mutationFragmentName)
        throw new Error(
          "When using a string mutationFragment, mutationFragmentName is mandatory"
        );
      queryFragmentName = props.mutationFragmentName;
    } else {
      // DocumentNode
      mutationFragment = props.mutationFragment;
      // automatically compute the fragment name
      mutationFragmentName =
        props.mutationFragmentName || getFragmentName(props.mutationFragment);
    }
  }
  // auto generate fragments
  let autoFormFragments;
  if (!props.queryFragment || !props.mutationFragment) {
    const { model, fields, addFields } = props;
    // autogenerated fragments
    autoFormFragments = getFormFragments({
      formType,
      model,
      fields,
      addFields,
    });
  }
  // use autogenerated value if necessary
  if (!props.queryFragment) {
    queryFragment = autoFormFragments.queryFragment;
    queryFragmentName = autoFormFragments.queryFragmentName;
  }
  if (!props.mutationFragment) {
    mutationFragment = autoFormFragments.mutationFragment;
    mutationFragmentName = autoFormFragments.mutationFragmentName;
  }
  return {
    mutationFragment: mutationFragment as DocumentNode,
    mutationFragmentName: mutationFragmentName as string,
    queryFragment: queryFragment as DocumentNode,
    queryFragmentName: queryFragmentName as string,
  };
};
// Fonctionnal version to be able to use hooks
export const FormContainer = (props: FormContainerProps) => {
  const {
    model,
    documentId,
    slug,
    fields,
    addFields,
    currentUser: currentUserFromProps,
    loadingCurrentUser: loadingCurrentUserFromProps,
  } = props;
  const { schema } = model;
  // if a document is being passed, this is an edit form
  const isEdit = documentId || slug;
  const selector = {
    documentId,
    slug,
  };
  const formType = isEdit ? "edit" : "new";
  const VulcanComponents = useVulcanComponents();

  // get query & mutation fragments from props or else default to same as generatedFragment
  //return {
  //  queryFragment,
  //  mutationFragment,
  //};
  //}

  const prefix = `${model.name}${capitalize(formType)}`;
  // props to pass on to child component (i.e. <Form />)
  const childProps = {
    formType,
    schema,
  };

  const {
    mutationFragment,
    mutationFragmentName,
    queryFragment,
    queryFragmentName,
  } = useFragments(props, formType);

  // options for useCreate, useUpdate and useDelete
  const mutationOptions = {
    model,
    // collection: this.props.collection,
    fragment: mutationFragment,
    fragmentName: mutationFragmentName,
  };

  const queryOptions: any /*UseSingleOptions<any>*/ = {
    model,
    // TODO: what this option does?
    // queryName: `${prefix}FormQuery`,
    fragment: queryFragment,
    fragmentName: queryFragmentName,
    // fragmentName?
    input: {
      id: documentId,
      enableCache: false,
      // TODO: support slug
    },
    queryOptions: {
      // we always want to load a fresh copy of the document
      fetchPolicy: "network-only" as const,
      pollInterval: 0, // no polling, only load data once
      skip: formType === "new",
    },
  };
  // @ts-expect-error TODO handle loading, refetch
  const { data, document, loading, refetch } = useSingle(queryOptions);
  if (formType !== "new") {
    debugForm(
      "useSingle result",
      "data",
      data,
      "document",
      document,
      "loading",
      loading
    );
  }
  // TODO: pass the creation functions down to the Form
  const [createDocument] = useCreate(mutationOptions);
  const [updateDocument] = useUpdate(mutationOptions);
  const [deleteDocument] = useDelete(mutationOptions);

  const {
    currentUser: currentUserFromContext,
    loading: loadingCurrentUserFromContext,
  } = useVulcanCurrentUser();
  const shouldGetCurrentUserFromProps =
    typeof currentUserFromProps !== "undefined";
  const currentUser = shouldGetCurrentUserFromProps
    ? currentUserFromProps
    : currentUserFromContext;
  const loadingCurrentUser = shouldGetCurrentUserFromProps
    ? loadingCurrentUserFromProps
    : loadingCurrentUserFromContext;

  // callbacks
  /*
  const formRef = useRef(null);
  const newMutationSuccessCallback = function <TData = Object>(
    result: SuccessfulFetchResult<TData>
  ) {
    getDocumentFromResult(result, "new");
  };
  const editMutationSuccessCallback = function <TData = Object>(
    result: SuccessfulFetchResult<TData>
  ) {
    getDocumentFromResult(result, "edit");
  };
  */

  /*
  The create hook already creates a document prop in a more stable way
  const getDocumentFromResult = function <TData = Object>(
    // must be called only on valid results
    result: SuccessfulFetchResult<TData> | undefined
  ) {
    if (!result) return undefined;
    // TODO: quite risky... we should have a better way to get the document
    let document = result.data[Object.keys(result.data)[0]].data; // document is always on first property

    return document;
  };*/
  // for new mutation, run refetch function if it exists
  /*
  if (mutationType === "new" && refetch) refetch();
  */

  const createAndReturnDocument = async (variables: CreateVariables) => {
    const result = await createDocument(variables);
    const { error, document } = result;
    return {
      document,
      error,
    };
  };
  const updateAndReturnDocument = async (variables: UpdateVariables) => {
    const result = await updateDocument(variables);
    // @ts-expect-error Not sure how error are handled now
    const { error, document } = result;
    return {
      document,
      error,
    };
  };

  const deleteDocumentAndRefetch = async (variables: DeleteVariables) => {
    await deleteDocument(variables as any);
  };

  if (isEdit && loading) {
    return <VulcanComponents.Loading />;
  }
  return (
    <VulcanComponents.Form
      document={document}
      loading={loading || loadingCurrentUser}
      createDocument={createAndReturnDocument /*createDocument*/}
      updateDocument={updateAndReturnDocument}
      deleteDocument={deleteDocumentAndRefetch}
      refetch={refetch}
      currentUser={currentUser}
      {...childProps}
      {...props}
    />
  );
};

/*
FormContainer.propTypes = {
  // main options
  documentId: PropTypes.string, // if a document is passed, this will be an edit form
  mutationFragment: PropTypes.object,
  mutationFragmentName: PropTypes.string,

  // graphQL
  // createFoo, deleteFoo, updateFoo
  // newMutation: PropTypes.func, // the new mutation
  // editMutation: PropTypes.func, // the edit mutation
  // removeMutation: PropTypes.func, // the remove mutation

  // form
  prefilledProps: PropTypes.object,
  layout: PropTypes.string,
  fields: PropTypes.arrayOf(PropTypes.string),
  hideFields: PropTypes.arrayOf(PropTypes.string),
  addFields: PropTypes.arrayOf(PropTypes.string),
  showRemove: PropTypes.bool,
  submitLabel: PropTypes.node,
  cancelLabel: PropTypes.node,
  revertLabel: PropTypes.node,
  repeatErrors: PropTypes.bool,
  warnUnsavedChanges: PropTypes.bool,
  formComponents: PropTypes.object,
  disabled: PropTypes.bool,
  itemProperties: PropTypes.object,
  successComponent: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  contextName: PropTypes.string,

  // callbacks
  ...callbackProps,

  currentUser: PropTypes.object,
  client: PropTypes.object,
};

FormContainer.defaultProps = {
  layout: "horizontal",
};
*/

/*
registerComponent({
  name: 'SmartForm',
  component: FormContainer,
  hocs: [withCurrentUser, withApollo, withRouter, withCollectionProps],
});
*/

export const SmartForm = FormContainer;

export default FormContainer;
