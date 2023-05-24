"use client";
import { useCurrentUser } from "~/lib/users/hooks";
/**
 * Verify the magic token from the url, and then sets the actual auth token,
 * then redirect
 *
 * NOTE: this could be an API route as well, but a web page let's us have a nicer
 * UI in case of error.
 */
import { useState, useEffect } from "react";
import { useMagicToken } from "~/account/magicLogin/hooks";
import { verifyMagicToken } from "~/account/magicLogin/client-actions";
import { routes } from "~/lib/routes";

import { FormattedMessage } from "~/components/common/FormattedMessage";
import { Loading } from "~/components/ui/Loading";

const useMagicLoginCheck = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | Error>(null);
  const { token, from } = useMagicToken();
  /**
   * If the user is anonymous, we already have a current user without an email
   * We must pass their id
   */
  const { currentUser, loading: currentUserLoading } = useCurrentUser();

  useEffect(() => {
    setLoading(true);
    if (token && !currentUserLoading) {
      // Pass the current user id
      const anonymousId = currentUser?._id;
      verifyMagicToken(token, anonymousId || undefined)
        .then(() => {
          if (from) {
            window.location.replace(from);
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
  }, [!!token, !!currentUserLoading]);

  return {
    loading: loading || currentUserLoading,
    error,
  };
};
const MagicLoginCheckPage = () => {
  const { loading, error } = useMagicLoginCheck();
  if (loading) return <Loading />;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <p>
      <FormattedMessage id="accounts.token_verified" />
    </p>
  );
};

export default MagicLoginCheckPage;
