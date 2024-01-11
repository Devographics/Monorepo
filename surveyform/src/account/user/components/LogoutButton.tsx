"use client";
import { useCurrentUser } from "~/lib/users/hooks";
import { useIntlContext } from "@devographics/react-i18n-legacy";
import React from "react";
import { Button } from "~/components/ui/Button";
import { logout } from "../client-fetchers/logout";
import { routes } from "~/lib/routes";

export const LogoutButton = ({ asLink }: { asLink?: boolean }) => {
  const intl = useIntlContext();
  const LinkOrButton = asLink ? "a" : Button;
  const { currentUser } = useCurrentUser();
  if (!currentUser) return null;
  return (
    <LinkOrButton
      onClick={async (evt) => {
        evt.preventDefault();
        try {
          await logout();
          window.location.replace(routes.home.href);
        } catch (err) {
          console.error(err);
        }
      }}
      {...(asLink && { href: "#" })}
    >
      {intl.formatMessage({
        id: `accounts.sign_out`,
      })}
    </LinkOrButton>
  );
};
