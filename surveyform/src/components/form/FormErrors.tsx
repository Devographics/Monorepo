"use client";
import { Alert } from "~/components/ui/Alert";
import get from "lodash/get.js";
import { FormattedMessage } from "~/components/common/FormattedMessage";

/**
 * Display errors for the current form, based on the context
 */
export const FormErrors = () => {
  const errors = [];
  return (
    <div className="form-errors">
      {!!errors.length && (
        <Alert className="flash-message" variant="danger">
          <ul>
            {errors.map((error, index) => (
              <li key={index}>
                <FormError error={error} errorContext="form" />
              </li>
            ))}
          </ul>
        </Alert>
      )}
    </div>
  );
};

export const FormError = ({ error, errorContext }) => {
  // use the error or error message as default message
  const defaultMessage = JSON.stringify(error.message || error);
  const id = error.id || "app.defaultError";

  // default props for all errors
  let messageProps = {
    id,
    defaultMessage,
    values: {
      errorContext,
      defaultMessage,
    },
  };

  // additional properties to enhance the message
  if (error.properties) {
    // in case this is a nested fields, only keep last segment of path
    const errorName =
      error.properties.name && error.properties.name.split(".").slice(-1)[0];
    messageProps.values = {
      ...messageProps.values,
      // if the error is triggered by a field, get the relevant label
      label: errorName,
      ...error.properties,
    };
  }

  if (error.data) {
    messageProps.values = {
      ...messageProps.values,
      ...error.data, // backwards compatibility
    };
  }

  const exception = get(error, "extensions.exception");
  if (exception) {
    messageProps = {
      ...messageProps,
      id: exception.id,
      values: exception.data,
    };
  }
  return <FormattedMessage {...messageProps} />;
};

FormError.defaultProps = {
  errorContext: "", // default context so format message does not complain
};
