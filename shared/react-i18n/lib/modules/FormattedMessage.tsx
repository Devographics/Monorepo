"use client";
import React from "react";
import { useIntlContext } from "./Provider";
import { intlShape } from "./shape";
import type { Message } from "./typings";

// Inspired by basic FormattedMessage component
// @see https://formatjs.io/docs/react-intl/components/#formattedmessage
export interface FormattedMessageProps extends Message {
  // props for react-intl
  values: any;
  className?: string;
  // additional props
  html?: boolean;
}

export const FormattedMessage = ({
  id,
  values,
  defaultMessage = "",
  html = false,
  className = "",
}: FormattedMessageProps) => {
  const intl = useIntlContext();
  let message = intl.formatMessage({ id, defaultMessage }, values);
  const cssClass = `i18n-message ${className}`;

  // if message is empty (no message found AND no default message), use [id]
  if (!message /* === ""*/) {
    message = `[${id}]`;
  }

  return html ? (
    <span
      data-key={id}
      className={cssClass}
      dangerouslySetInnerHTML={{ __html: message }}
    />
  ) : (
    <span data-key={id} className={cssClass}>
      {message}
    </span>
  );
};

FormattedMessage.contextTypes = {
  intl: intlShape,
};

export default FormattedMessage;
