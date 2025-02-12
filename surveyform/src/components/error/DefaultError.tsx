"use client";
import React from "react";

import { useI18n } from "@devographics/react-i18n";
import { useRouter } from "next/navigation";
import { routes } from "~/lib/routes";
import { LogoutButton } from "~/components/users";
import { Button } from "~/components/ui/Button";

// NOTE: this expects a latin language. Might need improvements/more reusability
const addPointToSentence = (sentence?: string | null) => {
  if (!sentence) return sentence;
  const trimmed = sentence.trim();
  if (trimmed[trimmed.length - 1].match(/[.!?]/)) return sentence;
  return `${trimmed}.`;
};

export interface DefaultErrorProps {
  error?: Error;
  proposeReload?: boolean;
  proposeHomeRedirection?: boolean;
  proposeLoginRedirection?: boolean;
  title?: string; // force a title at props level
  titleI18nToken?: string; // force a title i18nToken at props level
  message?: string;
  messageI18nToken?: string;
  onReload?: () => void;
  proposeLogout?: boolean;
}

// get title directly from error information
// can be overriden by props
const getTitleFromError = (error: Error | undefined, t: any) => {
  if (!error?.name) return t("error.unknown");
  //const errorI18nTokens = computeErrorI18nTokens(error);
  //if (errorI18nTokens?.titleI18nToken) return t(errorI18nTokens.titleI18nToken);
  return `${t("error.unknown")} "${error.name}"`;
};

/**
 * Expect to be nested below the translation context
 * @param param0
 * @returns
 */
export const DefaultErrorDisplay = ({
  error,
  message,
  messageI18nToken,
  title,
  titleI18nToken,
  proposeReload,
  proposeHomeRedirection,
  proposeLoginRedirection,
  onReload,
  proposeLogout,
}: DefaultErrorProps) => {
  //const classes = useStyles();
  //const { t } = useTranslation("common");
  const { t } = useI18n(); // TODO: detect when intl is not set and display the fallback messages instead
  const router = useRouter();

  // const hasAccessToken = !!getAccessToken();
  const shouldProposeLogout = false; /*proposeLogout
    ? !!currentUser || (isUserServiceUnavailable(error) && hasAccessToken)
    : false;
    */

  const hasButtons =
    proposeReload ||
    proposeHomeRedirection ||
    proposeLoginRedirection ||
    shouldProposeLogout;
  const errorMessage =
    message ||
    (messageI18nToken ? t(messageI18nToken) : t("error.an_error_has_occurred"));

  const defaultErrorTitle = getTitleFromError(error, t);
  const errorTitle =
    title || (titleI18nToken ? t(titleI18nToken) : defaultErrorTitle);

  return (
    <div className={"defaulterror"}>
      {/*<WarningIcon fontSize="large" />*/}
      <h2>
        {errorTitle}
        {error?.name && <span> {}</span>}
      </h2>
      {!!errorMessage && (
        <p>
          <span>Error message: {addPointToSentence(errorMessage)}</span>{" "}
          <span>{t("error.message_sent_to_technical_team")}</span>
        </p>
      )}
      {hasButtons && (
        <div className={"buttonsWrapper"}>
          {proposeReload && (
            <>
              <p /*className={classes.tryReloadMessage}*/>
                {" "}
                {t("error.try_reloading_the_page") || "Try reloading the page"}
              </p>
              <Button
                //color="primary"
                //variant="outlined"
                onClick={() => {
                  if (onReload) {
                    onReload();
                  } else {
                    window.location.reload();
                  }
                }}
              >
                {t("error.retry") || "Reload"}
              </Button>
            </>
          )}
          {proposeHomeRedirection && (
            <Button
              //variant="outlined"
              onClick={() => {
                router.push(routes.home.href);
              }}
            >
              {t("error.redirect_to_home") || "Back to home"}
            </Button>
          )}
          {proposeLoginRedirection && (
            <Button
              //variant="outlined"
              onClick={() => {
                router.push(routes.home.href);
              }}
            >
              {t("error.redirect_to_login") || "Go to login"}
            </Button>
          )}
          {shouldProposeLogout && <LogoutButton />}
        </div>
      )}
    </div>
  );
};

/**
 * Can be placed outside the i18n context, won't try to access the i18n context
 * @returns
 */
export const RawErrorDisplay = ({
  error,
  message,
  title,
  proposeReload,
  proposeHomeRedirection,
  proposeLoginRedirection,
  onReload,
  proposeLogout,
}: DefaultErrorProps) => {
  //const classes = useStyles();
  //const { t } = useTranslation("common");
  const router = useRouter();

  // const hasAccessToken = !!getAccessToken();
  const shouldProposeLogout = false; /*proposeLogout
    ? !!currentUser || (isUserServiceUnavailable(error) && hasAccessToken)
    : false;
    */

  const hasButtons =
    proposeReload ||
    proposeHomeRedirection ||
    proposeLoginRedirection ||
    shouldProposeLogout;
  const errorMessage = message || error?.message || "An error has occurred";

  const errorTitle = title || error?.name;

  return (
    <div className={"defaulterror"}>
      {/*<WarningIcon fontSize="large" />*/}
      <h2>
        {errorTitle}
        {error?.name && <span> {}</span>}
      </h2>
      {!!errorMessage && (
        <p>
          <span>Error message: {addPointToSentence(errorMessage)}</span>{" "}
          <span>A message has been sent to the technical team.</span>
        </p>
      )}
      {hasButtons && (
        <div className={"buttonsWrapper"}>
          {proposeReload && (
            <>
              <p /*className={classes.tryReloadMessage}*/>
                {" "}
                {"Try reloading the page"}
              </p>
              <Button
                //color="primary"
                //variant="outlined"
                onClick={() => {
                  if (onReload) {
                    onReload();
                  } else {
                    window.location.reload();
                  }
                }}
              >
                {"Reload"}
              </Button>
            </>
          )}
          {proposeHomeRedirection && (
            <Button
              //variant="outlined"
              onClick={() => {
                router.push(routes.home.href);
              }}
            >
              {"Back to home"}
            </Button>
          )}
          {proposeLoginRedirection && (
            <Button
              //variant="outlined"
              onClick={() => {
                router.push(routes.home.href);
              }}
            >
              {"Go to login"}
            </Button>
          )}
          {shouldProposeLogout && <LogoutButton />}
        </div>
      )}
    </div>
  );
};
