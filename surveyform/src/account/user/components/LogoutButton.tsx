import { useUser } from "~/account/user/hooks";
import { routes } from "~/lib/routes";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { useIntlContext } from "@vulcanjs/react-i18n";
import { apiRoutes } from "~/lib/apiRoutes";
import React from "react";

export const LogoutButton = ({
  component,
}: {
  component?: React.ComponentType<any> | React.ElementType<any>;
}) => {
  const Components = useVulcanComponents();
  const intl = useIntlContext();
  const LinkOrButton = component || Components.Button;
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
    >
      {intl.formatMessage({
        id: `accounts.sign_out`,
      })}
    </LinkOrButton>
  );
};
