/**
 * Change compared to Vulcan Meteor:
 * after/before => After, Before with titlecase
 */
import React, { useEffect } from "react";
import _omit from "lodash/omit.js";
import _get from "lodash/get.js";
import { useFormContext } from "@devographics/react-form";
import { FormNestedDivider } from "./FormNestedDivider";
import FormNestedArrayLayout from "./FormNestedArrayLayout";
import { FormNestedItem } from "./FormNestedItem";

// Wraps the FormNestedItem, repeated for each object
// Allow for example to have a label per object
export const FormNestedArrayInnerLayout = (props) => {
  const { label, children, addItem, BeforeComponent, AfterComponent } = props;
  return (
    <div className="form-nested-array-inner-layout">
      <BeforeComponent {...props} />
      {children}
      <FormNestedDivider label={label} addItem={addItem} />
      <AfterComponent {...props} />
    </div>
  );
};

export interface FormNestedArrayProps<TValue = any> {
  value: TValue;
  /** Path for the nested object */
  path: string;
  itemProperties: any;
  minCount?: number;
  maxCount?: number;
  arrayField?: boolean;
  nestedArrayErrors: any;
  hasErrors?: boolean;
  // TODO: get from context
  prefilledProps?: any;
  addItem: Function | null;
}
export const FormNestedArray = (props: FormNestedArrayProps) => {
  const { updateCurrentValues, deletedValues, errors } = useFormContext();
  /*static defaultProps = {
    itemProperties: {},
  };*/
  const value = props.value || [];

  const addItem = () => {
    const { prefilledProps, path } = props;
    updateCurrentValues(
      { [`${path}.${value.length}`]: _get(prefilledProps, `${path}.$`) || {} },
      { mode: "merge" }
    );
  };

  const removeItem = (index) => {
    updateCurrentValues({ [`${props.path}.${index}`]: null });
  };

  /*

  Go through this.context.deletedValues and see if any value matches both the current field
  and the given index (ex: if we want to know if the second address is deleted, we
  look for the presence of 'addresses.1')
  */
  const isDeleted = (index) => {
    return deletedValues.includes(`${props.path}.${index}`);
  };

  const computeVisibleIndex = (values) => {
    let currentIndex = 0;
    const visibleIndexes = values.map((subDocument, subDocumentIndx) => {
      if (isDeleted(subDocumentIndx)) {
        return 0;
      } else {
        currentIndex = currentIndex + 1;
        return currentIndex;
      }
    });
    return visibleIndexes;
  };

  useEffect(() => {
    if (props.itemProperties.openNested) addItem();
  }, []);

  const visibleItemIndexes = computeVisibleIndex(value);
  // do not pass FormNested's own value, input and inputProperties props down
  const properties = {
    ..._omit(
      props,
      "value",
      "input",
      "inputProperties",
      "nestedInput",
      "beforeComponent",
      "afterComponent"
    ),
  };
  const { path, minCount, maxCount, arrayField } = props;

  //filter out null values to calculate array length
  let arrayLength = value.filter((singleValue) => {
    return typeof singleValue !== "undefined" && singleValue !== null;
  }).length;
  properties.addItem = !maxCount || arrayLength < maxCount ? addItem : null;

  // only keep errors specific to the nested array (and not its subfields)
  properties.nestedArrayErrors = errors.filter(
    (error) => error.path && error.path === path
  );
  properties.hasErrors = !!(
    properties.nestedArrayErrors && properties.nestedArrayErrors.length
  );

  return (
    <FormNestedArrayLayout {...properties}>
      {value.map((subDocument, i) => {
        if (isDeleted(i)) return null;
        const path = `${props.path}.${i}`;
        const visibleItemIndex = visibleItemIndexes[i];
        return (
          <FormNestedArrayInnerLayout
            // @ts-expect-error TODO: there is a confusion between this field being a boolean
            // or the actual definition of the array field?
            {...arrayField}
            key={path}
            addItem={addItem}
            itemIndex={i}
            visibleItemIndex={visibleItemIndex}
            path={path}
          >
            <FormNestedItem
              {...properties}
              itemIndex={i}
              visibleItemIndex={visibleItemIndex}
              path={path}
              removeItem={() => {
                removeItem(i);
              }}
              hideRemove={!!minCount && arrayLength <= minCount}
            />
          </FormNestedArrayInnerLayout>
        );
      })}
    </FormNestedArrayLayout>
  );
};

export const formComponentsDependencies = [
  "FormNestedArrayInnerLayout",
  "FormNestedArrayLayout",
];

export default FormNestedArray;

export const IconAdd = ({ width = 24, height = 24 }) => (
  <svg
    width={width}
    height={height}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
  >
    <path
      fill="currentColor"
      d="M448 294.2v-76.4c0-13.3-10.7-24-24-24H286.2V56c0-13.3-10.7-24-24-24h-76.4c-13.3 0-24 10.7-24 24v137.8H24c-13.3 0-24 10.7-24 24v76.4c0 13.3 10.7 24 24 24h137.8V456c0 13.3 10.7 24 24 24h76.4c13.3 0 24-10.7 24-24V318.2H424c13.3 0 24-10.7 24-24z"
    />
  </svg>
);

export const IconRemove = ({ width = 24, height = 24 }) => (
  <svg
    width={width}
    height={height}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
  >
    <path
      fill="currentColor"
      d="M424 318.2c13.3 0 24-10.7 24-24v-76.4c0-13.3-10.7-24-24-24H24c-13.3 0-24 10.7-24 24v76.4c0 13.3 10.7 24 24 24h400z"
    />
  </svg>
);
