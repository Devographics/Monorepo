import React from "react";

//import WarningIcon from "@mui/icons-material/Warning";
//
//import Button from "@mui/material/Button";
//import makeStyles from "~/lib/mui/makeStyles";
import { useIntlContext } from "@devographics/react-i18n";
// import routes from "~/config/routes";
import { useRouter } from "next/router.js";
import { routes } from "~/lib/routes";
import { LogoutButton } from "~/account/user/components";
import { Button } from "../ui/Button";

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
  const intl = useIntlContext();
  // TODO: detect when intl is not set and display the fallback messages instead
  // console.log(intl);
  const { formatMessage } = intl;
  const t = (token) => {
    return formatMessage({ id: token });
  };
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
    <div /*className={classes.content}*/ style={{ flexDirection: "column" }}>
      {/*<WarningIcon fontSize="large" />*/}
      <h2>
        {errorTitle}
        {error?.name && <span> {}</span>}
      </h2>
      <p>
        <span>{addPointToSentence(errorMessage)}</span>{" "}
        <span>{t("error.message_sent_to_technical_team")}</span>
      </p>
      {hasButtons && (
        <div /*className={classes.buttonsWrapper}*/>
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
