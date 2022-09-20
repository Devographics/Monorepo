import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useIntlContext } from "@vulcanjs/react-i18n";

const getFormattedMessage = (intlKeys, intl) => {
  if (!intlKeys.length) {
    console.error("No intlKeys provided to an Help component")
    return null
  }
  for (const intlKey of intlKeys) {
    const formattedMessage = intl.formatMessage({ id: intlKey })
    if (formattedMessage) return formattedMessage
  }
  console.warn("No translation found for at least one of those intlKeys", intlKeys)
  return intlKeys[0]
}
export const Help = ({ intlKeys }) => {
  const intl = useIntlContext();
  const formattedMessage = getFormattedMessage(intlKeys, intl)
  return (
    <div className="form-help">
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>
        {formattedMessage}
      </ReactMarkdown>
    </div>
  );
};

export default Help;
