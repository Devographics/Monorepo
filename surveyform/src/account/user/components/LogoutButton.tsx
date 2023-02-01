import { useUser } from "~/account/user/hooks";
import { routes } from "~/lib/routes";
import { useIntlContext } from "@devographics/react-i18n";
import { apiRoutes } from "~/lib/apiRoutes";
import React from "react";
import { Button } from "~/core/components/ui/Button";

export const LogoutButton = ({
  component,
}: {
  component?: React.ComponentType<any> | React.ElementType<any>;
}) => {
  const intl = useIntlContext();
  const LinkOrButton = (component || Button) as React.ComponentType<any>;
  const { user } = useUser();
  if (!user) return null;
  return (
    <LinkOrButton
      onClick={async (evt) => {
        evt.preventDefault();
        await fetch(apiRoutes.account.logout.href, {
          method: "POST",
        });
        window.location.replace(routes.home.href);
      }}
      {...(component && { href: "#" })}
    >
      {intl.formatMessage({
        id: `accounts.sign_out`,
      })}
    </LinkOrButton>
  );
};
