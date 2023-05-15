"use client";
import { useState } from "react";
import _some from "lodash/some.js";
import { VulcanUser, isAdmin } from "@vulcanjs/permissions";
import { FieldGroup } from "@vulcanjs/schema";
import { useFormContext } from "@devographics/react-form";
import FormComponent from "./FormComponent";

export interface FormGroupProps {
  name: string;
  label: string;
  group: FieldGroup /*{
    adminsOnly?: boolean;
    beforeComponent?: any;
  };*/;
  fields: Array<any>; //Array<FormField>;
  hidden?: boolean | Function;
  disabled?: boolean;
  document: any;
  currentUser?: VulcanUser;
  itemProperties: any;
  formType: any;
  prefilledProps: any;
}

/**
 * TODO: take unused props into account
 * @param param0
 * @returns
 */
export const FormGroupLayout = ({
  anchorName,
  collapsed,
  hasErrors,
  group,
  document,
  toggle,
  ...props
}) => {
  return <fieldset {...props} />;
};

export const FormGroupHeader = (props) => <h2 {...props} />;

export const FormGroup /*<FormGroupProps, FormGroupState>*/ = (
  props: FormGroupProps
) => {
  // TODO: get value/update methods from context instead
  const {
    name,
    label,
    group,
    fields,
    hidden,
    document,
    currentUser,
    disabled,
    itemProperties,
    prefilledProps,
    formType,
  } = props;
  const { errors, clearFieldErrors } = useFormContext();
  const [collapsed, setCollapsed] = useState<boolean>(
    group.startCollapsed || false
  );
  const toggle = () => setCollapsed((collapsed) => !collapsed);
  // if at least one of the fields in the group has an error, the group as a whole has an error
  const hasErrors = _some(fields, (field) => {
    return !!errors.filter((error) => error.path === field.path).length;
  });

  const isHidden =
    typeof hidden === "function"
      ? hidden({ ...props, document })
      : hidden || false;
  /*
  static propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    order: PropTypes.number,
    hidden: PropTypes.func,
    fields: PropTypes.array.isRequired,
    group: PropTypes.object.isRequired,
    errors: PropTypes.array.isRequired,
    throwError: PropTypes.func.isRequired,
    currentValues: PropTypes.object.isRequired,
    updateCurrentValues: PropTypes.func.isRequired,
    deletedValues: PropTypes.array.isRequired,
    addToDeletedValues: PropTypes.func.isRequired,
    clearFieldErrors: PropTypes.func.isRequired,
    formType: PropTypes.string.isRequired,
    currentUser: PropTypes.object,
    prefilledProps: PropTypes.object,
  };*/

  const heading = (
    <FormGroupHeader
      toggle={toggle}
      label={label}
      collapsed={collapsed}
      hidden={isHidden}
      group={group}
    />
  );

  if (group.adminsOnly && !isAdmin(currentUser)) {
    return null;
  }
  const anchorName = name.split(".").length > 1 ? name.split(".")[1] : name;

  return (
    <FormGroupLayout
      label={label}
      anchorName={anchorName}
      toggle={toggle}
      collapsed={collapsed}
      hidden={isHidden}
      group={group}
      heading={name === "default" ? null : heading}
      hasErrors={hasErrors}
      document={document}
    >
      {/* TODO: create TS error at the moment: group.beforeComponent && <group.beforeComponent {...props} />*/}
      {/** TODO: we pass all the functions as props to the FormComponent,
       * but it should rely on the context instead for methods
       */}

      {fields.map((field) => (
        <FormComponent
          key={field.name}
          disabled={disabled}
          {...field}
          document={document}
          itemProperties={{
            ...itemProperties,
            ...field.itemProperties,
          }}
          clearFieldErrors={clearFieldErrors}
          formType={formType}
          currentUser={currentUser}
          prefilledProps={prefilledProps}
        />
      ))}

      {/* TODO: create TS error at the moment: group.afterComponent && <group.afterComponent {...props} />*/}
    </FormGroupLayout>
  );
};

export default FormGroup;
