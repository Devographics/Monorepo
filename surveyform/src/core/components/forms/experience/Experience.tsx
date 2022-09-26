import React, { useState, useEffect } from "react";
import { FormCheck } from "react-bootstrap";
import isEmpty from "lodash/isEmpty.js";
// import { isOtherValue, removeOtherMarker, addOtherMarker } from './Checkboxgroup';
import {
  FormInputProps,
  useFormContext,
  useVulcanComponents,
} from "@vulcanjs/react-ui";
import { useEntities } from "~/core/components/common/EntitiesContext";

import IconComment from "~/core/components/icons/Comment";

// const OtherComponent = ({ value, path }: Pick<FormInputProps, "path" | "value">) => {
//   const { updateCurrentValues } = useFormContext()
//   const Components = useVulcanComponents()
//   const otherValue = removeOtherMarker(value);

//   // keep track of whether "other" field is shown or not
//   const [showOther, setShowOther] = useState(isOtherValue(value));

//   // keep track of "other" field value locally
//   const [textFieldValue, setTextFieldValue] = useState(otherValue);

//   // whenever value changes (and is not empty), if it's not an "other" value
//   // this means another option has been selected and we need to uncheck the "other" radio button
//   useEffect(() => {
//     if (value) {
//       setShowOther(isOtherValue(value));
//     }
//   }, [value]);

//   // textfield properties
//   const textFieldInputProperties = {
//     name: path,
//     value: textFieldValue,
//     onChange: event => {
//       const fieldValue = event.target.value;
//       // first, update local state
//       setTextFieldValue(fieldValue);
//       // then update global form state
//       const newValue = isEmpty(fieldValue) ? null : addOtherMarker(fieldValue);
//       updateCurrentValues({ [path]: newValue });
//     },
//   };
//   const textFieldItemProperties = { layout: 'elementOnly' };

//   return (
//     <div className="form-option-other">
//       <FormCheck
//         name={path}
//         // @ts-expect-error
//         layout="elementOnly"
//         label={'Other'}
//         value={showOther}
//         checked={showOther}
//         type="radio"
//         onClick={event => {
//           // @ts-expect-error
//           const isChecked = event.target.checked;
//           // clear any previous values to uncheck all other checkboxes
//           updateCurrentValues({ [path]: null });
//           setShowOther(isChecked);
//         }}
//       />
//       {showOther && <Components.FormComponentText inputProperties={textFieldInputProperties} itemProperties={textFieldItemProperties} />}
//     </div>
//   );
// };

export const FormComponentRadioGroup = ({
  refFunction,
  path,
  inputProperties,
  itemProperties = {},
}: FormInputProps) => {
  const Components = useVulcanComponents();
  const { updateCurrentValues } = useFormContext();
  const { questionId } = itemProperties;

  const { data, loading, error } = useEntities();
  const { entities } = data;
  const entity = entities?.find((e) => e.id === questionId);

  // @ts-expect-error
  const { options = [], value, ...otherInputProperties } = inputProperties;
  const hasValue = value !== "";
  return (
    <Components.FormItem
      path={/*inputProperties.*/ path}
      label={inputProperties.label}
      {...itemProperties}
    >
      {entity?.example && <CodeExample {...entity.example} />}
      <div>
        {options.map((option, i) => {
          const isChecked = value === option.value;
          const checkClass = hasValue
            ? isChecked
              ? "form-check-checked"
              : "form-check-unchecked"
            : "";
          return (
            // @ts-expect-error
            <FormCheck
              {...otherInputProperties}
              key={i}
              layout="elementOnly"
              type="radio"
              // @ts-ignore
              label={<Components.FormOptionLabel option={option} />}
              value={option.value}
              name={path}
              id={`${path}.${i}`}
              path={`${path}.${i}`}
              ref={refFunction}
              checked={isChecked}
              className={checkClass}
            />
          );
        })}
        {/* {itemProperties.showOther && (
        <OtherComponent value={value} path={path} />
      )} */}
      </div>
      <IconComment />
    </Components.FormItem>
  );
};

const CodeExample = ({ language, code, codeHighlighted }) => {
  const Components = useVulcanComponents();
  return (
    <div className="code-example">
      <h5 className="code-example-heading">
        <Components.FormattedMessage id="general.code_example" />
      </h5>
      <pre>
        <code dangerouslySetInnerHTML={{ __html: codeHighlighted }}></code>
      </pre>
    </div>
  );
};

export default FormComponentRadioGroup;
