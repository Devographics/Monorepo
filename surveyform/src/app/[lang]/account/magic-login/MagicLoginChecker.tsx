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

const useMagicLoginCheck = ({
  token,
  from,
}: {
  token: string;
  from?: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | Error>(null);
  /**
   * If the user is anonymous, we already have a current user without an email
   * We must pass their id
   */

  useEffect(() => {
    setLoading(true);
    if (token) {
      verifyMagicToken(token)
        .then(() => {
          if (from) {
            // the query param can be used to immediately redirect user or display a specific message
            window.location.replace(from + "?from-magic-login=1");
          } else {
            // We do a full page reload to avoid any caching issue and not just a SPA router.push
            window.location.replace(routes.home.href);
          }
        })
        .catch((err) => {
          setError(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [!!token]);

  return {
    loading,
    error,
  };
};
export const MagicLoginChecker = ({
  token,
  from,
}: {
  token: string;
  from?: string;
}) => {
  const { loading, error } = useMagicLoginCheck({ token, from });
  if (loading) return <Loading />;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <p>
      <FormattedMessage id="accounts.token_verified" />
    </p>
  );
};
