/*

Main form component.

This component expects:

### All Forms:

- collection
- currentUser
- client (Apollo client)

*/

import React, { useEffect, useRef, useState } from "react";
import { runCallbacks, getErrors } from "@vulcanjs/core";
import { useIntlContext } from "@vulcanjs/react-i18n";
import { removeProperty } from "@vulcanjs/utils";
import _filter from "lodash/filter.js";
import cloneDeep from "lodash/cloneDeep.js";
import compact from "lodash/compact.js";
import get from "lodash/get.js";
import isObject from "lodash/isObject.js";
import mapValues from "lodash/mapValues.js";
import merge from "lodash/merge.js";
import omit from "lodash/omit.js";
import omitBy from "lodash/omitBy.js";
import pick from "lodash/pick.js";
import pickBy from "lodash/pickBy.js";
import set from "lodash/set.js";
import unset from "lodash/unset.js";
import update from "lodash/update.js";
import without from "lodash/without.js";
import isEmpty from "lodash/isEmpty.js";
//import type { FormLayoutProps } from "../../elements/FormLayout";
//import type { FormSubmitProps } from "../../elements/FormSubmit";

import {
  convertSchema,
  getEditableFields,
  getInsertableFields,
} from "../../utils/schema_utils";
import { isEmptyValue } from "../../utils/utils";
import { getParentPath } from "../../utils/path_utils";
// import withCollectionProps from "./withCollectionProps";
import { FormContext } from "../FormContext";
import { getFieldGroups, getFieldNames, getLabel } from "./fields";
import { isNotSameDocument } from "./utils";
import { useWarnOnUnsaved } from "../../hooks/useWarnOnUnsaved";

import type { FormType } from "../../typings";
import {
  CreateDocumentResult,
  FormProps,
  FormState,
  UpdateDocumentResult,
} from "./typings";
import { MutationResult } from "@apollo/client";
import { useVulcanComponents } from "../../../VulcanComponents/Consumer";
import { useSubmitCallbacks } from "./hooks";

const NEW_FORM_TYPE = "new";
const EDIT_FORM_TYPE = "edit";

// props that should trigger a form reset
const RESET_PROPS = [
  "model",
  // "collection",
  // "collectionName",
  "document",
  "schema",
  "currentUser",
  "fields",
  "removeFields",
  "prefilledProps", // TODO: prefilledProps should be merged instead?
];

const compactParent = (object, path) => {
  const parentPath = getParentPath(path);

  // note: we only want to compact arrays, not objects
  const compactIfArray = (x) => (Array.isArray(x) ? compact(x) : x);

  update(object, parentPath, compactIfArray);
};

const getDefaultValues = (convertedSchema) => {
  // TODO: make this work with nested schemas, too
  return pickBy(
    mapValues(convertedSchema, (field) => field.defaultValue),
    (value) => value
  );
};

const compactObject = (o) => omitBy(o, (f) => f === null || f === undefined);

const getInitialStateFromProps = (nextProps: FormProps): FormState => {
  const schema = nextProps.schema || nextProps.model.schema;
  const convertedSchema = convertSchema(schema);
  const formType: FormType = nextProps.document
    ? EDIT_FORM_TYPE
    : NEW_FORM_TYPE;
  // for new document forms, add default values to initial document
  const defaultValues =
    formType === NEW_FORM_TYPE ? getDefaultValues(convertedSchema) : {};
  // note: we remove null/undefined values from the loaded document so they don't overwrite possible prefilledProps
  const initialDocument = merge(
    {},
    defaultValues,
    nextProps.prefilledProps,
    compactObject(nextProps.document)
  );

  //if minCount is specified, go ahead and create empty nested documents
  Object.keys(convertedSchema).forEach((key) => {
    let minCount = convertedSchema[key].minCount;
    if (minCount) {
      initialDocument[key] = initialDocument[key] || [];
      while (initialDocument[key].length < minCount)
        initialDocument[key].push({});
    }
  });

  // remove all instances of the `__typename` property from document
  removeProperty(initialDocument, "__typename");

  return {
    disabled: nextProps.disabled,
    errors: [],
    deletedValues: [],
    currentValues: {},
    originalSchema: convertSchema(schema, { removeArrays: false }),
    // convert SimpleSchema schema into JSON object
    schema: convertedSchema,
    // Also store all field schemas (including nested schemas) in a flat structure
    flatSchema: convertSchema(schema, { flatten: true }),
    // the initial document passed as props
    initialDocument,
    // initialize the current document to be the same as the initial document
    currentDocument: initialDocument,
  };
};

const getChildrenProps = (
  props: FormProps,
  state: Pick<FormState, "disabled" | "currentDocument">,
  options: { formType: FormType },
  // TODO: that belongs to the context instead
  callbacks: { deleteDocument: Function }
): {
  formLayoutProps: any; //FormLayoutProps;
  formGroupProps: Function;
  commonProps: any;
  formSubmitProps: any; // FormSubmitProps;
} => {
  const {
    currentUser,
    repeatErrors,
    submitLabel,
    cancelLabel,
    revertLabel,
    cancelCallback,
    revertCallback,
    id,
    model,
    prefilledProps,
    itemProperties,
    contextName,
    showRemove,
    showDelete,
  } = props;
  const { disabled, currentDocument } = state;
  const { formType } = options;
  const { deleteDocument } = callbacks;
  const commonProps = {
    document: currentDocument,
    formType,
    currentUser,
    disabled,
    prefilledProps,
    itemProperties,
    contextName,
  };

  const docClassName = `document-${formType}`;
  const modelName = model.name.toLowerCase();
  const formProps = {
    className: `${docClassName} ${docClassName}-${modelName}`,
    id: id,
    // It's the form element responsibility to get submitForm from context
    // onSubmit: this.submitForm(formType),
    // TODO: update to useRef
    //ref: (e) => {
    //  this.form = e;
    //},
  };

  const formGroupProps = (group) => ({
    key: group.name,
    ...group,
    group: omit(group, ["fields"]),
    ...commonProps,
  });

  const formSubmitProps = {
    model,
    currentUser,
    submitLabel,
    cancelLabel,
    revertLabel,
    cancelCallback,
    revertCallback,
    document: currentDocument,
    // TODO: should probably be passed through context
    deleteDocument:
      (formType === EDIT_FORM_TYPE &&
        showRemove &&
        showDelete &&
        deleteDocument) ||
      null,
  };

  const formLayoutProps = {
    formProps: formProps,
    repeatErrors: repeatErrors,
    submitProps: formSubmitProps,
    commonProps,
  };
  return {
    commonProps,
    formSubmitProps,
    formGroupProps,
    formLayoutProps,
  };
};

// component form until we go stateless
const FormWarnUnsaved = ({
  isChanged,
  warnUnsavedChanges,
  children,
}: {
  isChanged: boolean;
  warnUnsavedChanges?: boolean;
  children: React.ReactNode;
}) => {
  useWarnOnUnsaved({
    isChanged,
    warnUnsavedChanges,
  });
  return <>{children}</>;
};

/*

  Like getDocument, but cross-reference with getFieldNames()
  to only return fields that actually need to be submitted

  Also remove any deleted values.

  */
const getData = (
  customArgs,
  props: FormProps,
  state: Pick<FormState, "currentDocument" | "deletedValues">,
  // previously from "this" object
  { submitFormCallbacks, form }: any
) => {
  const { currentDocument } = state;
  const { model, prefilledProps } = props;
  // we want to keep prefilled data even for hidden/removed fields
  let data = prefilledProps || {};

  // omit prefilled props for nested fields
  data = omitBy(data, (value, key) => key.endsWith(".$"));

  const args = {
    schema: model.schema,
    excludeRemovedFields: false,
    excludeHiddenFields: false,
    replaceIntlFields: true,
    addExtraFields: false,
    ...customArgs,
  };

  // only keep relevant fields
  // for intl fields, make sure we look in foo_intl and not foo
  const fields = getFieldNames(props, currentDocument, args);
  data = { ...data, ...pick(currentDocument, ...fields) };

  // compact deleted values
  state.deletedValues.forEach((path) => {
    if (path.includes(".")) {
      /*

        If deleted field is a nested field, nested array, or nested array item, try to compact its parent array

        - Nested field: 'address.city'
        - Nested array: 'addresses.1'
        - Nested array item: 'addresses.1.city'

        */
      compactParent(data, path);
    }
  });

  // run data object through submitForm callbacks
  data = runCallbacks({
    callbacks: submitFormCallbacks,
    iterator: data,
    args: [
      {
        /*form: this*/
      },
    ],
  });

  return data;
};

export const Form = (props: FormProps) => {
  const { initCallback, createDocument, updateDocument, deleteDocument } =
    props;
  const initialState = getInitialStateFromProps(props);
  const { schema, originalSchema, flatSchema, initialDocument } = initialState;
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // toggle flag after first render/mounting
      return;
    }
    if (initCallback) initCallback(initialState.currentDocument);
  }, [initCallback]);
  const defaultProps = {
    layout: "horizontal",
    prefilledProps: {},
    repeatErrors: false,
    showRemove: true,
    showDelete: true,
  };
  const allProps = { ...defaultProps, ...props };
  const defaultValues = {};
  const intl = useIntlContext();

  const { callbacks, addToFailureForm, addToSubmitForm, addToSuccessForm } =
    useSubmitCallbacks();

  const { submitFormCallbacks, successFormCallbacks, failureFormCallbacks } =
    callbacks;

  // --------------------------------------------------------------------- //
  // ------------------------------- Errors ------------------------------ //
  // --------------------------------------------------------------------- //

  /*

  Add error to form state

  Errors can have the following properties:
    - id: used as an internationalization key, for example `errors.required`
    - path: for field-specific errors, the path of the field with the issue
    - properties: additional data. Will be passed to vulcan-i18n as values
    - message: if id cannot be used as i81n key, message will be used

  */
  const [errors, setErrors] = useState<Array<any>>([]);
  const throwError = (error) => {
    let formErrors = getErrors(error);

    // eslint-disable-next-line no-console
    console.log(formErrors);

    // add error(s) to state
    setErrors((prevErrors) => [...prevErrors, ...formErrors]);
  };

  /*

  Clear errors for a field

  */
  const clearFieldErrors = (path) => {
    setErrors((prevErrors) =>
      prevErrors.filter((error) => error.path !== path)
    );
  };

  // --------------------------------------------------------------------- //
  // ------------------------------- Context ----------------------------- //
  // --------------------------------------------------------------------- //

  const [deletedValues, setDeletedValues] = useState<Array<any>>([]);

  // add something to deleted values
  const addToDeletedValues = (name) => {
    setDeletedValues((prevDeletedValues) => [...prevDeletedValues, name]);
  };

  /*
  setFormState = (fn) => {
    this.setState(fn);
  };
  */

  const [currentValues, setCurrentValues] = useState<Object>({});

  const submitFormContext = async (event /*newValues*/) => {
    /*
    TODO: previously this callback was updating the current values with new values after this call
    Need to check how this worked in Vulcan initially
    setCurrentValues((prevCurrentValues) => ({
      ...prevCurrentValues,
      ...newValues,
    }));
    */
    // TODO: previously, this was using a callback from setCurrentValues
    // this needs to be rearchitectured to work without, will need some check
    // https://stackoverflow.com/questions/56247433/how-to-use-setstate-callback-on-react-hooks
    await submitForm(event);
  };

  // --------------------------------------------------------------------- //
  // ------------------------------ Lifecycle ---------------------------- //
  // --------------------------------------------------------------------- //

  /*

  When props change, reinitialize the form  state
  Triggered only for data related props (collection, document, currentUser etc.)

  @see https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html

  */
  /*
  UNSAFE_componentWillReceiveProps(nextProps) {
    const needReset = !!RESET_PROPS.find(
      (prop) => !isEqual(this.props[prop], nextProps[prop])
    );
    if (needReset) {
      const newState = getInitialStateFromProps(nextProps);
      this.setState(newState);
      if (nextProps.initCallback)
        nextProps.initCallback(newState.currentDocument);
    }
  }*/

  const [currentDocument, setCurrentDocument] = useState<{
    title?: string;
    _id?: string;
    name?: string;
  }>(initialDocument);

  /*

  Manually update the current values of one or more fields(i.e. on change or blur).

  */
  const updateCurrentValues = (newValues, options: { mode?: string } = {}) => {
    // default to overwriting old value with new
    const { mode = "overwrite" } = options;
    const { changeCallback } = props;

    // keep the previous ones and extend (with possible replacement) with new ones
    // keep only the relevant properties
    const newState = {
      currentValues: cloneDeep(currentValues),
      currentDocument: cloneDeep(currentDocument),
      deletedValues: cloneDeep(deletedValues),
    };

    Object.keys(newValues).forEach((key) => {
      const path = key;
      let value = newValues[key];

      if (isEmptyValue(value)) {
        // delete value
        unset(newState.currentValues, path);
        set(newState.currentDocument, path, null);
        newState.deletedValues = [...newState.deletedValues, path];
      } else {
        // 1. update currentValues
        set(newState.currentValues, path, value);

        // 2. update currentDocument
        // For arrays and objects, give option to merge instead of overwrite
        if (mode === "merge" && (Array.isArray(value) || isObject(value))) {
          const oldValue = get(newState.currentDocument, path);
          set(newState.currentDocument, path, merge(oldValue, value));
        } else {
          set(newState.currentDocument, path, value);
        }

        // 3. in case value had previously been deleted, "undelete" it
        newState.deletedValues = without(newState.deletedValues, path);
      }
    });
    if (changeCallback) changeCallback(newState.currentDocument);

    // TODO: prefer  a reducer
    setCurrentValues(newState.currentValues);
    setCurrentDocument(newState.currentDocument);
    setDeletedValues(newState.deletedValues);
  };

  /*

  Refetch the document from the database (in case it was updated by another process or to reset the form)

  */
  const refetchForm = () => {
    if (props.refetch) {
      props.refetch();
    }
  };

  const [disabled, setDisabled] = useState<boolean>(!!props.disabled);
  const [success, setSuccess] = useState<boolean>(false); // TODO
  /**
   * Clears form errors and values.
   *
   * @example Clear form
   *  // form will be fully emptied, with exception of prefilled values
   *  clearForm({ document: {} });
   *
   * @example Reset/revert form
   *  // form will be reverted to its initial state
   *  clearForm();
   *
   * @example Clear with new values
   *  // form will be cleared but initialized with the new document
   *  const document = {
   *    // ... some values
   *  };
   *  clearForm({ document });
   *
   * @param {Object=} options
   * @param {Object=} options.document
   *  Document to use as new initial document when values are cleared instead of
   *  the existing one. Note that prefilled props will be merged
   */
  const clearForm = (options: { document?: any } = {}) => {
    const { document: optionsDocument } = options;
    const document = optionsDocument
      ? merge({}, props.prefilledProps, optionsDocument)
      : null;
    // TODO: prefer a reducer
    setErrors([]);
    setCurrentValues({});
    setDeletedValues([]);
    setCurrentDocument(document || initialDocument);
    // setInitialDocument(document || initialDocument);
    setDisabled(false);
  };

  const newMutationSuccessCallback = function <TModel = Object>(
    result: CreateDocumentResult<TModel>
  ) {
    mutationSuccessCallback(result, NEW_FORM_TYPE);
  };

  const editMutationSuccessCallback = function <TModel = Object>(
    result: UpdateDocumentResult<TModel>
  ) {
    mutationSuccessCallback(result, EDIT_FORM_TYPE);
  };

  const formRef = useRef(null);
  const mutationSuccessCallback = function <TModel = Object>(
    // must be called only on valid results
    result: CreateDocumentResult<TModel>,
    mutationType: FormType
  ) {
    // TODO: use a reducer
    setDisabled(false);
    setSuccess(true);
    // for new mutation, run refetch function if it exists
    // TODO: the create mutation should already return the freshest value, do we really need that?
    // instead we might want to update currentResult with the result of the creation
    if (mutationType === NEW_FORM_TYPE) refetchForm();
    let { document } = result;

    // call the clear form method (i.e. trigger setState) only if the form has not been unmounted
    // (we are in an async callback, everything can happen!)
    // TODO: this should rely on a ref
    if (formRef.current) {
      clearForm({
        document: mutationType === EDIT_FORM_TYPE ? document : undefined,
      });
    }

    // run document through mutation success callbacks
    document = runCallbacks({
      callbacks: successFormCallbacks,
      iterator: document,
      args: [{ form: formRef.current }],
    });

    // run success callback if it exists
    if (props.successCallback) props.successCallback(document, { form: this });
  };

  // catch graphql errors
  const mutationErrorCallback = (document, error) => {
    setDisabled(false);

    // eslint-disable-next-line no-console
    console.error("// graphQL Error");
    // eslint-disable-next-line no-console
    console.error(error);

    // run mutation failure callbacks on error, we do not allow the callbacks to change the error
    runCallbacks({
      callbacks: failureFormCallbacks,
      iterator: error,
      args: [{ error, form: formRef.current }],
    });

    if (!isEmpty(error)) {
      // add error to state
      throwError(error);
    }

    // run error callback if it exists
    if (props.errorCallback)
      props.errorCallback(document, error, { form: this });

    // scroll back up to show error messages
    // TODO: migrate this to scroll on top of the form
    //Utils.scrollIntoView(".flash-message");
  };

  const getSubmitData = () => {
    // complete the data with values from custom components
    // note: it follows the same logic as SmartForm's getDocument method
    let data = getData(
      { replaceIntlFields: true, addExtraFields: false, mutableFields },
      props,
      {
        currentDocument,
        deletedValues,
      },
      { form: formRef.current, submitFormCallbacks }
    );

    // if there's a submit callback, run it
    if (props.submitCallback) {
      data = props.submitCallback(data) || data;
    }
    return data;
  };
  /** 

  Submit form handler

  On success/failure, will call the relevant callbacks

  */
  const submitFormCreate = async (event?: Event) => {
    event && event.preventDefault();
    event && event.stopPropagation();
    const { contextName } = props;
    // if form is disabled (there is already a submit handler running) don't do anything
    if (disabled) {
      return;
    }
    // clear errors and disable form while it's submitting
    setErrors([]);
    setDisabled(true);

    const data = getSubmitData();

    // create document form
    try {
      const result = await createDocument({
        input: {
          data,
          contextName,
        },
      });
      if (result.errors?.length) {
        // TODO: previously got from meta, we could have more than 1 error
        mutationErrorCallback(document, result.errors[0]);
      } else {
        newMutationSuccessCallback(result);
      }
    } catch (error) {
      mutationErrorCallback(document, error);
    }
  };
  /** 

  Submit form handler

  On success/failure, will call the relevant callbacks

  */
  const submitFormUpdate = async (event?: Event) => {
    event && event.preventDefault();
    event && event.stopPropagation();

    const { contextName } = props;

    // if form is disabled (there is already a submit handler running) don't do anything
    if (disabled) {
      return;
    }

    // clear errors and disable form while it's submitting
    setErrors([]);
    setDisabled(true);

    // complete the data with values from custom components
    // note: it follows the same logic as SmartForm's getDocument method
    const data = getSubmitData();

    // update document form
    try {
      const documentId = currentDocument._id;
      const result = await updateDocument({
        input: {
          id: documentId,
          data,
          contextName,
        },
      });
      // TODO: handle more than 1 error
      if (result.errors?.length) {
        mutationErrorCallback(document, result.errors[0]);
      } else {
        editMutationSuccessCallback(result);
      }
    } catch (error) {
      mutationErrorCallback(document, error);
    }
  };

  /*

  Delete document handler

  */
  const deleteDocumentWithConfirm = () => {
    const document = currentDocument;
    const documentId = props.document._id;
    const documentTitle = document.title || document.name || "";

    const deleteDocumentConfirm = intl.formatMessage(
      { id: "forms.delete_confirm" },
      { title: documentTitle }
    );

    if (window.confirm(deleteDocumentConfirm)) {
      deleteDocument({ input: { id: documentId } })
        .then((mutationResult) => {
          // the mutation result looks like {data:{collectionRemove: null}} if succeeded
          if (props.removeSuccessCallback)
            props.removeSuccessCallback({ documentId, documentTitle });
          refetchForm();
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log(error);
        });
    }
  };

  // --------------------------------------------------------------------- //
  // ------------------------- Props to Pass ----------------------------- //
  // --------------------------------------------------------------------- //

  // --------------------------------------------------------------------- //
  // ----------------------------- Render -------------------------------- //
  // --------------------------------------------------------------------- //

  const { successComponent, document, currentUser, model, warnUnsavedChanges } =
    props;
  const FormComponents = useVulcanComponents();

  const formType: FormType = document ? EDIT_FORM_TYPE : NEW_FORM_TYPE;

  /** 

  Submit form handler

  On success/failure, will call the relevant callbacks

  */
  const submitForm =
    formType === NEW_FORM_TYPE ? submitFormCreate : submitFormUpdate;

  // Fields computation
  const mutableFields =
    formType === EDIT_FORM_TYPE
      ? getEditableFields(schema, currentUser, initialDocument)
      : getInsertableFields(schema, currentUser);

  const { formLayoutProps, formGroupProps } = getChildrenProps(
    props,
    { disabled, currentDocument },
    {
      formType,
    },
    {
      deleteDocument: deleteDocumentWithConfirm,
    }
  );
  const isChanged = isNotSameDocument(initialDocument, currentDocument);

  return success && successComponent ? (
    successComponent
  ) : (
    <FormWarnUnsaved
      isChanged={isChanged}
      warnUnsavedChanges={warnUnsavedChanges}
    >
      <FormContext.Provider
        value={{
          throwError,
          clearForm,
          refetchForm,
          isChanged,
          submitForm: submitFormContext, //Change in name because we already have a function
          // called submitForm, but no reason for the user to know
          // about that
          addToDeletedValues: addToDeletedValues,
          updateCurrentValues: updateCurrentValues,
          getDocument: () => currentDocument,
          getLabel: (fieldName, fieldLocale) =>
            getLabel(model, flatSchema, intl, fieldName, fieldLocale),
          initialDocument: initialDocument,
          // TODO BAD: check where used
          //setFormState: this.setFormState,
          addToSubmitForm,
          addToSuccessForm,
          addToFailureForm,
          errors,
          currentValues,
          deletedValues,
          clearFieldErrors,
          disabled,
        }}
      >
        <FormComponents.FormLayout {...formLayoutProps}>
          {getFieldGroups(
            props,
            {
              currentDocument,
              schema,
              flatSchema,
              originalSchema,
            },
            intl,
            mutableFields,
            intl.formatMessage
          ).map((group, i) => (
            <FormComponents.FormGroup key={i} {...formGroupProps(group)} />
          ))}
        </FormComponents.FormLayout>
      </FormContext.Provider>
    </FormWarnUnsaved>
  );
};

// Mutation that yield a success result
type SuccessfulMutationResult<TData = Object> = MutationResult<TData> & {
  data: TData;
};
/**
 * Typeguared to allow considering the request as successful
 */
const isSuccessful = function <T = any>(
  result: MutationResult<T> | undefined
): result is SuccessfulMutationResult<T> {
  return !!result?.data;
};

export default Form;
