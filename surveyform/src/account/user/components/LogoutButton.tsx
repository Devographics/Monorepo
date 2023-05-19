"use client";
import { useCurrentUser } from "~/lib/users/hooks";
import { routes } from "~/lib/routes";
import { useIntlContext } from "@devographics/react-i18n";
import React from "react";
import { Button } from "~/components/ui/Button";
import { logout } from "../lib/logout";

export const LogoutButton = ({
  component,
}: {
  component?: React.ComponentType<any> | React.ElementType<any>;
}) => {
  const intl = useIntlContext();
  const LinkOrButton = (component || Button) as React.ComponentType<any>;
  const { currentUser } = useCurrentUser();
  if (!currentUser) return null;
  return (
    <LinkOrButton
      onClick={async (evt) => {
        evt.preventDefault();
        await logout();
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
