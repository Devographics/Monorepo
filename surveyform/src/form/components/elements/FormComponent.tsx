/**
 * TODO: rename "FieldComponent" to clarify
 * Change compared to Meteor:
 * - custom inputs cannot be a reference anymore, you need to pass the whole component and not just the name
 * - FormComponents context is limited to default component. Other components must be passed through the schema instead
 * (it means you can't extend the SmartForm with new inputType, instead use a fully custom input)
 */
import React, { ComponentType, useEffect, useState } from "react";
import get from "lodash/get.js";
import SimpleSchema from "simpl-schema";
const { isEmptyValue, getNullValue } = utils;
import {
  VulcanFieldSchema,
  VulcanFieldInput,
  VulcanFieldType,
} from "@vulcanjs/schema";
import { getAutoInputFromType } from "../inputs/consts";
import {
  useFormContext,
  useVulcanComponents,
  utils,
} from "@devographics/react-form";
import { FormComponentProps } from "../../typings";
import { FormComponentLoader } from "./FormComponentLoader";
import { FormComponentInner } from "./FormComponentInner";

const getCharacterCounts = (value: any, max: number) => {
  const characterCount: number = value && value.length ? value.length : 0;
  return { charsRemaining: max - characterCount, charsCount: characterCount };
};

/**
 * Get field path, taking intlInput fields into account
 */
const getPath = ({
  intlInput,
  path,
}: {
  intlInput?: boolean;
  path: string;
}) => {
  return intlInput ? `${path}_intl` : path;
};

const getCharacterCountsFromProps = ({
  document,
  max,
  intlInput,
  path,
}: Pick<FormComponentProps, "document" | "max" | "intlInput" | "path">) => {
  if (!max) {
    return null;
  }
  const fieldPath = getPath({ intlInput, path });
  const intlOrRegularValue = document?.[fieldPath];
  const value =
    intlOrRegularValue && typeof intlOrRegularValue === "object"
      ? intlOrRegularValue.value
      : intlOrRegularValue;
  return getCharacterCounts(value, max);
};

// TODO: move to schema helpers
const isArrayField = (type: VulcanFieldSchema["type"]) => {
  return type === Array;
};

// TODO: not up to date
const isObjectField = (type: VulcanFieldSchema["type"]) => {
  return type instanceof SimpleSchema;
};

/*

  Get form input type, either based on input props, or by guessing based on form field type

  */
const getInputName = (fieldType: VulcanFieldType, input?: VulcanFieldInput) => {
  if (input) return input;
  return getAutoInputFromType(fieldType);
};

/*
  Returns true if the passed input type is a custom
  NOTE: it also accept non-standard name, if you want to add a new type of Input in the context
  */
/*
const isCustomInput = (inputType: VulcanFieldInput) => {
  if (typeof inputType !== "string") return true;
  const isStandardInput = allVulcanInputs.includes(inputType);
  return !isStandardInput;
};
*/

/*

  Function passed to FormComponentInner to help with rendering the component

  */
const getFormInput = ({
  type,
  input,
  FormComponents,
}: {
  type: VulcanFieldType;
  input: VulcanFieldInput;
  FormComponents: any;
}): // TODO: we could type the props here, it's an InputComponent to be more precise
ComponentType => {
  if (typeof input === "function") {
    // input is listed in "customComponents"
    const InputComponent = input;
    return InputComponent;
  } else {
    // @deprecated
    // ideally, this branch should not be hit, instead define a custom "input" function
    console.warn("Hitting deprecated switch in getFormInput:", type, input);
    console.warn("Define input in 'customComponent' instead");
    // NOTE: don't forget to register them beforehand in the relevant VulcanComponentsProvider
    // for each question in "customComponents"
    const inputName = getInputName(type, input);
    switch (inputName) {
      case "text":
        return FormComponents.FormComponentDefault;

      case "password":
        return FormComponents.FormComponentPassword;

      case "number":
        return FormComponents.FormComponentNumber;

      case "url":
        return FormComponents.FormComponentUrl;

      case "email":
        return FormComponents.FormComponentEmail;

      case "textarea":
        return FormComponents.FormComponentTextarea;

      case "checkbox":
        return FormComponents.FormComponentCheckbox;

      case "checkboxgroup":
        return FormComponents.FormComponentCheckboxGroup;

      case "radiogroup":
        return FormComponents.FormComponentRadioGroup;

      case "select":
        return FormComponents.FormComponentSelect;

      case "selectmultiple":
        return FormComponents.FormComponentSelectMultiple;

      case "datetime":
        return FormComponents.FormComponentDateTime;

      case "date":
        return FormComponents.FormComponentDate;

      // case "date2":
      //   return FormComponents.FormComponentDate2;

      case "time":
        return FormComponents.FormComponentTime;

      case "statictext":
        return FormComponents.FormComponentStaticText;

      case "likert":
        return FormComponents.FormComponentLikert;

      case "autocomplete":
        return FormComponents.FormComponentAutocomplete;

      case "multiautocomplete":
        return FormComponents.FormComponentMultiAutocomplete;

      default:
        // @see https://github.com/VulcanJS/vulcan-npm/pull/31 discussions about custom components support from the context
        throw new Error(
          `Input name "${inputName}" is not a standard Vulcan form input (type: ${type}, input: ${input})`
        );
    }
  }
};

/**
 * Component for the display of any field of the form
 */
export const FormComponent = (props: FormComponentProps) => {
  /*
  TODO: replace with a useMemo
  shouldComponentUpdate(nextProps, nextState) {
    // allow custom controls to determine if they should update
    if (this.isCustomInput(this.getInputType(nextProps))) {
      return true;
    }

    const { document, deletedValues, errors } = nextProps;
    const path = getPath(this.props);

    // when checking for deleted values, both current path ('foo') and child path ('foo.0.bar') should trigger updates
    const includesPathOrChildren = (deletedValues) =>
      deletedValues.some((deletedPath) => deletedPath.includes(path));

    const valueChanged = !isEqual(
      get(document, path),
      get(this.props.document, path)
    );
    const errorChanged = !isEqual(this.getErrors(errors), this.getErrors());
    const deleteChanged =
      includesPathOrChildren(deletedValues) !==
      includesPathOrChildren(this.props.deletedValues);
    const charsChanged = nextState.charsRemaining !== this.state.charsRemaining;
    const disabledChanged = nextProps.disabled !== this.props.disabled;
    const helpChanged = nextProps.help !== this.props.help;

    const shouldUpdate =
      valueChanged ||
      errorChanged ||
      deleteChanged ||
      charsChanged ||
      disabledChanged ||
      helpChanged;

    return shouldUpdate;
  }*/

  const {
    locale,
    max,
    path,
    //type,
    datatype,
    input,
    intlInput,
    nestedInput,
    query,
    options,
  } = props;
  const { updateCurrentValues, deletedValues, clearFieldErrors } =
    useFormContext();

  const type = datatype;
  const countFromProps = getCharacterCountsFromProps(props);
  // equivalent to getDerivedStateFromProps
  const [charsCountState, setCharacterCounts] = useState<{
    charsCount: number;
    charsRemaining: number;
  } | null>(countFromProps);

  // TODO: move this logic somewhere else, as it is specific to String components.
  // Eg using an intermediate FormComponentText
  /*
  Updates the state of charsCount and charsRemaining as the users types
  */
  const updateCharacterCount = (value) => {
    if (!max)
      throw new Error(
        "Cannot update character count when no max value is set."
      );
    setCharacterCounts(getCharacterCounts(value, max));
  };
  useEffect(() => {
    if (countFromProps) {
      setCharacterCounts(countFromProps);
    }
  }, [countFromProps?.charsCount, countFromProps?.charsRemaining]);
  /*

  Whether to keep track of and show remaining chars

  */
  let showCharsRemaining = false;
  let inputName = null;
  if (typeof input === "string") {
    inputName = getInputName(type, input);
    showCharsRemaining = !!(
      typeof max !== "undefined" &&
      inputName &&
      ["url", "email", "textarea", "text"].includes(inputName)
    );
  }
  // const inputType = inputName; // TODO: rename inputType in the corresponding child components

  /*
  Function passed to form controls (always controlled) to update their value
  (Note: we could use the context instead?)
  */
  const handleChange = (value) => {
    // if value is an empty string, delete the field
    if (value === "") {
      value = null;
    }
    // if this is a number field, convert value before sending it up to Form
    if (type === Number && value != null) {
      value = Number(value);
    } else if (type === SimpleSchema.Integer && value != null) {
      value = parseInt(value);
    }

    if (value !== getValue()) {
      const updateValue = locale ? { locale: locale, value } : value;
      updateCurrentValues({ [getPath(props)]: updateValue });
      clearFieldErrors(getPath(props));
    }

    // for text fields, update character count on change
    if (showCharsRemaining) {
      updateCharacterCount(value);
    }
  };

  /*
  Get value from Form state through document and currentValues props
    // TODO: get document from context
  */
  const getValue = () => {
    //const c = context || this.context;
    const { locale, defaultValue, formType, datatype } = props;
    const path = locale ? `${getPath(props)}.value` : getPath(props);
    const currentDocument = props.document;
    let value = get(currentDocument, path);
    // note: force intl fields to be treated like strings
    const nullValue = locale ? "" : getNullValue(datatype);

    // handle deleted & empty value
    if (deletedValues.includes(path)) {
      value = nullValue;
    } else if (isEmptyValue(value)) {
      // replace empty value by the default value from the schema if it exists – for new forms only
      value = formType === "new" && defaultValue ? defaultValue : nullValue;
    }
    return value;
  };

  /*

  Get errors from Form state through context

  Note: we use `includes` to get all errors from nested components, which have longer paths

  */
  const getErrors = (errors?: Array<any>) => {
    errors = errors || props.errors || [];
    const fieldErrors = errors.filter(
      (error) => error.path && error.path.includes(path)
    );
    return fieldErrors;
  };

  /*

  Function passed to form controls to clear their contents (set their value to null)

  */
  const clearField = (event) => {
    event.preventDefault();
    event.stopPropagation();
    updateCurrentValues({ [path]: null });
    if (showCharsRemaining) {
      updateCharacterCount(null);
    }
  };

  const FormComponents = useVulcanComponents();

  if (intlInput) {
    return <FormComponents.FormIntl {...props} />;
  } else if (!input && nestedInput) {
    if (isArrayField(type)) {
      return (
        <FormComponents.FormNestedArray
          {...props}
          formComponents={FormComponents}
          errors={getErrors()}
          value={getValue()}
        />
      );
    } else if (isObjectField(type)) {
      return (
        <FormComponents.FormNestedObject
          {...props}
          formComponents={FormComponents}
          errors={getErrors()}
          value={getValue()}
        />
      );
    }
  }

  const fciProps = {
    ...props,
    ...(charsCountState || {}),
    inputType: getInputName(type, input),
    value: getValue(),
    errors: getErrors(),
    showCharsRemaining: !!showCharsRemaining,
    handleChange: handleChange,
    clearField: clearField,
    formInput: getFormInput({ FormComponents, input, type }),
  };

  // if there is no query, handle options here; otherwise they will be handled by
  // the FormComponentLoader component
  if (!query && typeof options === "function") {
    fciProps.options = options(fciProps);
  }

  // @ts-ignore
  const fci = <FormComponentInner {...fciProps} />;

  return query ? (
    // @ts-ignore
    <FormComponentLoader {...fciProps}>{fci}</FormComponentLoader>
  ) : (
    fci
  );
};

export const formComponentsDependencies = [
  "FormComponentDefault",
  "FormComponentPassword",
  "FormComponentNumber",
  "FormComponentUrl",
  "FormComponentEmail",
  "FormComponentTextarea",
  "FormComponentCheckbox",
  "FormComponentCheckboxGroup",
  "FormComponentRadioGroup",
  "FormComponentSelect",
  "FormComponentSelectMultiple",
  "FormComponentDateTime",
  "FormComponentDate",
  "FormComponentDate2",
  "FormComponentTime",
  "FormComponentStaticText",
  "FormComponentLikert",
  "FormComponentAutocomplete",
  "FormComponentMultiAutocomplete",
];

export default FormComponent;
