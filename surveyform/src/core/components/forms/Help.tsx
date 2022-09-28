import React from "react";
import rehypeRaw from "rehype-raw";
import { useIntlContext } from "@vulcanjs/react-i18n";
import { DynamicReactMarkdown } from "../markdown/DynamicReactMarkdown";

const getFormattedMessage = (intlKeys, intl) => {
  if (!intlKeys.length) {
    console.error("No intlKeys provided to an Help component");
    return null;
  }
  for (const intlKey of intlKeys) {
    const formattedMessage = intl.formatMessage({ id: intlKey });
    if (formattedMessage) return formattedMessage;
  }
  console.warn(
    "No translation found for at least one of those intlKeys",
    intlKeys
  );
  return intlKeys[0];
};
export const Help = ({ intlKeys }) => {
  const intl = useIntlContext();
  const formattedMessage = getFormattedMessage(intlKeys, intl);
  return (
    <div className="form-help">
      <DynamicReactMarkdown rehypePlugins={[rehypeRaw]}>
        {formattedMessage}
      </DynamicReactMarkdown>
    </div>
  );
};

export default Help;
