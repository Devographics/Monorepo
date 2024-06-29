"use client";
import { useIntlContext } from "@devographics/react-i18n-legacy";
import { TranslatorWrapper, useTranslatorMode } from "./TranslatorWrapper";

export interface FormattedMessageProps {
  id: string;
  values?: any;
  defaultMessage?: string;
  className?: string;
}
/**
 * @deprecated Use @devographics/react-i18n
 * @param param0 
 * @returns 
 */
export const FormattedMessage = ({
  id,
  values,
  defaultMessage,
  className = "",
}: FormattedMessageProps) => {
  // Using the id as default message can be useful for tests,
  // if you don't want to display the id in prod, at least leave it in NODE_ENV="development" and NEXT_PUBLIC_NODE_ENV="test"
  defaultMessage = defaultMessage || id;
  const intl = useIntlContext();
  const translatorMode = useTranslatorMode();

  // The message can contain sanitized HTML
  let message = intl.formatMessage({ id, defaultMessage, values })
    // @ts-expect-error TODO: now the parsed message returns the "t" and "tHTML" values
    ?.t;
  const props: any = {
    "data-key": id,
  };
  const classNames = ["i18n-message", className, "t"];
  props.className = classNames.join(" ");
  const renderedMessage = (
    <span {...props} dangerouslySetInnerHTML={{ __html: message || id }} />
  );
  if (translatorMode)
    return (
      <TranslatorWrapper id={id} message={message}>
        {renderedMessage}
      </TranslatorWrapper>
    );
  return renderedMessage;
};
