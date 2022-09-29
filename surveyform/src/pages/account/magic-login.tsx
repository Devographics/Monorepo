/**
 * Verify the magic token from the url, and then sets the actual auth token,
 * then redirect
 *
 * NOTE: this could be an API route as well, but a web page let's us have a nicer
 * UI in case of error.
 */
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { useState, useEffect } from "react";
import { useMagicToken } from "~/account/magicLogin/hooks";
import { verifyMagicToken } from "~/account/magicLogin/lib";
import { routes } from "~/lib/routes";

import { FormattedMessage } from "~/core/components/common/FormattedMessage";

const useMagicLoginCheck = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | Error>(null);
  const { token, from } = useMagicToken();
  /**
   * If the user is anonymous, we already have a current user without an email
   * We must pass their id
   */
  const { user, loading: currentUserLoading } = useUser();

  useEffect(() => {
    setLoading(true);
    if (token && !currentUserLoading) {
      // Pass the current user id
      const anonymousId = user?._id;
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
export const MagicLoginCheckPage = () => {
  const Components = useVulcanComponents();
  const { loading, error } = useMagicLoginCheck();
  if (loading) return <Components.Loading />;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <p>
      <FormattedMessage id="accounts.token_verified" />
    </p>
  );
};

import { getLocaleStaticProps } from "~/i18n/server/ssr";
import { useUser } from "~/account/user/hooks";
export async function getStaticProps(ctx) {
  return getLocaleStaticProps(ctx);
}

export default MagicLoginCheckPage;
