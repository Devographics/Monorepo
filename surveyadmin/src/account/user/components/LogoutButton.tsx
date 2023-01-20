import { useUser } from "~/account/user/hooks";
import { routes } from "~/lib/routes";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { apiRoutes } from "~/lib/apiRoutes";
import React from "react";
import { Button } from "~/core/components/ui/Button";

export const LogoutButton = ({
  component,
}: {
  component?: React.ComponentType<any> | React.ElementType<any>;
}) => {
  const Components = useVulcanComponents();
  const LinkOrButton = component || Button;
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
      Logout
    </LinkOrButton>
  );
};
