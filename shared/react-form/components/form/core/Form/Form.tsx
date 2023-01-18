/*

Main form component.

This component expects:

### All Forms:

- collection
- currentUser
- client (Apollo client)

*/

import React, { useEffect, useRef, useState } from "react";
import { getErrors } from "@vulcanjs/core";
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
import pickBy from "lodash/pickBy.js";
import set from "lodash/set.js";
import unset from "lodash/unset.js";
import update from "lodash/update.js";
import without from "lodash/without.js";

import {
  convertSchema,
  getEditableFields,
  getInsertableFields,
} from "../../utils/schema_utils";
import { isEmptyValue } from "../../utils/utils";
import { getParentPath } from "../../utils/path_utils";
import { FormContext } from "../FormContext";
import { getFieldGroups, getLabel } from "./fields";
import { isNotSameDocument } from "./utils";
import { useWarnOnUnsaved } from "../../hooks/useWarnOnUnsaved";

import type { FormType } from "../../typings";
import { FormProps, FormState } from "./typings";
import { useVulcanComponents } from "../../../VulcanComponents/Consumer";
import { useSubmitCallbacks } from "./hooks";

const NEW_FORM_TYPE = "new";
const EDIT_FORM_TYPE = "edit";

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
  options: { formType: FormType }
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

export const Form = (props: FormProps) => {
  const { initCallback } = props;
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
  const intl = useIntlContext();

  const { addToFailureForm, addToSubmitForm, addToSuccessForm } =
    useSubmitCallbacks();

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

export default Form;
