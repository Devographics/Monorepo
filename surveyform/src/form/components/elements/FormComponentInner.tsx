import React from "react";
import { useIntlContext } from "@devographics/react-i18n";
import { uiUtils, FormInputProps } from "@devographics/react-form";
import cslx, { clsx } from "clsx";
const { whitelistInputProps } = uiUtils;
/*
import {
  instantiateComponent,
  whitelistInputProps,
} from "meteor/vulcan:core";
*/
import { clearableInputs } from "../inputs/consts";
import { FormComponentInnerProps } from "../../typings";
import { FieldErrors } from "./FieldErrors";

export const FormComponentInner = (props: FormComponentInnerProps) => {
  const intl = useIntlContext();
  const { inputType, disabled, clearField } = props;

  const renderClear = () => {
    if (clearableInputs.includes(inputType) && !disabled) {
      /*
      From bootstrap:
        <Components.TooltipTrigger
          trigger={
            <button
              className="form-component-clear"
              title={this.context.intl.formatMessage({
                id: "forms.clear_field",
              })}
              onClick={this.props.clearField}
            >
              <span>✕</span>
            </button>
          }
        >
          <Components.FormattedMessage id="forms.clear_field" />
        </Components.TooltipTrigger>
        */
      return (
        <button
          className="form-component-clear"
          title={intl.formatMessage({
            id: "forms.clear_field",
          })}
          onClick={clearField}
        >
          <span>✕</span>
        </button>
      );
    }
  };

  const getProperties = (): FormInputProps => {
    const {
      handleChange,
      inputType,
      itemProperties,
      help,
      description,
      loading,
      formComponents,
      intlKeys,
    } = props;
    const properties = {
      ...props,
      inputProperties: {
        ...whitelistInputProps(props),
        onChange: (event) => {
          // FormComponent's handleChange expects value as argument; look in target.checked or target.value
          const inputValue =
            inputType === "checkbox"
              ? // TODO: not sure why we need an ignore there
                // @ts-ignore
                event.target.checked
              : // @ts-ignore
                event.target.value;
          if (handleChange) {
            handleChange(inputValue);
          }
        },
      },

      itemProperties: {
        ...itemProperties,
        intlKeys,
        Components: formComponents,
        description: description || help,
        loading,
      },
    };
    // @ts-expect-error
    return properties;
  };

  const {
    inputClassName,
    name,
    input,
    //inputType,
    beforeComponent,
    afterComponent,
    errors,
    showCharsRemaining,
    charsRemaining,
    renderComponent,
    formInput,
  } = props;

  const hasErrors = errors && errors.length;

  const inputName = typeof input === "function" ? input.name : inputType;
  const inputClass = clsx(
    "form-input",
    inputClassName,
    `input-${name}`,
    `form-component-${inputName || "default"}`,
    hasErrors && "input-error"
  );
  const properties = getProperties();

  const FormInput = formInput;

  return (
    <div className={inputClass}>
      {/*instantiateComponent(beforeComponent, properties)*/}
      <FormInput {...properties} />
      {hasErrors ? <FieldErrors errors={errors} /> : null}
      {renderClear()}
      {showCharsRemaining && (
        <div
          className={clsx(
            "form-control-limit",
            charsRemaining < 10 && "danger"
          )}
        >
          {charsRemaining}
        </div>
      )}
      {/*instantiateComponent(afterComponent, properties)*/}
    </div>
  );
};
