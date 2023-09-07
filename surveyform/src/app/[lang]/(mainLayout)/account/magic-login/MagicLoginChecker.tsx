"use client";
/**
 * NOTE: this CAN'T be moved to a server component
 * Because verification depends on calling an API Route,
 * which itself depends on Passport
 * which itself depends on Express/Connect
 * => you can't currently verify user token in an RSC or a
 *
 * Verify the magic token from the url, and then sets the actual auth token,
 * then redirect
 *
 * NOTE: this could be an API route as well, but a web page let's us have a nicer
 * UI in case of error.
 */
import { useState, useEffect } from "react";
import { verifyMagicToken } from "~/account/magicLogin/client-actions";
import { routes } from "~/lib/routes";

import { FormattedMessage } from "~/components/common/FormattedMessage";
import { Loading } from "~/components/ui/Loading";
import { useClientData } from "~/components/page/hooks";
import { getEditionSectionPath } from "~/lib/surveys/helpers/getEditionSectionPath";
import { useLocaleContext } from "~/i18n/context/LocaleContext";

const useMagicLoginCheck = ({
  token,
  redirectTo,
  editionId,
  surveyId,
}: {
  token: string;
  redirectTo?: string;
  editionId?: string;
  surveyId?: string;
}) => {
  const { locale } = useLocaleContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | Error>(null);
  /**
   * If the user is anonymous, we already have a current user without an email
   * We must pass their id
   */

  const clientData = useClientData({ editionId, surveyId });

  useEffect(() => {
    const verifyToken = async () => {
      setLoading(true);
      if (token) {
        const res = await verifyMagicToken({ token, redirectTo, clientData });
        const result = await res.json();
        const { response, editionId, surveyId } = result;
        let path;
        if (response) {
          path = getEditionSectionPath({
            edition: { id: editionId },
            survey: { id: surveyId },
            locale,
            response,
          });
        } else if (redirectTo) {
          path = redirectTo;
        } else {
          path = routes.home.href;
        }
        // TODO: having that query param triggers hydration mismatch errors?
        // We do a full page reload to avoid any caching issue and not just a SPA router.push
        // window.location.replace(path + "?from-magic-login=1");
        window.location.replace(path);
      }
      setLoading(false);
    };
    verifyToken().catch((err) => {
      setError(err);
    });
  }, [!!token]);

  return {
    loading,
    error,
  };
};
export const MagicLoginChecker = ({
  token,
  redirectTo,
  editionId,
  surveyId,
}: {
  token: string;
  redirectTo?: string;
  editionId?: string;
  surveyId?: string;
}) => {
  const { loading, error } = useMagicLoginCheck({
    token,
    redirectTo,
    editionId,
    surveyId,
  });
  if (loading) return <Loading />;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <p>
      <FormattedMessage id="accounts.token_verified" />
    </p>
  );
};
