import pick from "lodash/pick.js";

/**
 * Extract input props for the FormComponentInner
 * @param {*} props All component props
 * @returns Initial props + props specific to the HTML input in an inputProperties object
 */
export const getHtmlInputProps = (props) => {
  const { name, path, options, label, onChange, onBlur, value, disabled } =
    props;

  // these properties are whitelisted so that they can be safely passed to the actual form input
  // and avoid https://facebook.github.io/react/warnings/unknown-prop.html warnings
  const inputProperties = {
    ...props.inputProperties,
    name,
    path,
    options,
    label,
    onChange,
    onBlur,
    value,
    disabled,
  };

  return {
    ...props,
    inputProperties,
  };
};

/**
 * Extract input props for the FormComponentInner
 * @param {*} props All component props
 * @returns Initial props + props specific to the HTML input in an inputProperties object
 */
export const whitelistInputProps = (
  props: any
): React.HTMLProps<HTMLInputElement> => {
  const whitelist = [
    "name",
    "path",
    "options",
    "label",
    "onChange",
    "onBlur",
    "value",
    "disabled",
    "placeholder",
  ];
  const value = props.value;
  let safeValue = value;
  // No null values in HTML inputs
  if (value === null) safeValue = undefined;
  // if value is null, return undefined
  return { ...pick(props, whitelist), value: safeValue };
};
