"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useCurrentUser } from "~/lib/users/hooks";
import { routes } from "~/lib/routes";
import { LogoutButton } from "~/account/user/components/LogoutButton";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { DebugZone } from "./DebugZone";
import { publicConfig } from "~/config/public";

const links = [
  {
    component: (
      <span>
        &copy; 2023 <a href="https://devographics.com/">Devographics</a>
      </span>
    ),
  },
  {
    showIf: ({ currentUser }) => !!currentUser,
    id: "nav.account",
    href: routes.account.profile.href,
  },
  {
    showIf: ({ currentUser }) => !currentUser,
    id: "accounts.sign_in",
    href: routes.account.login.href,
  },
  {
    id: "general.privacy_policy",
    href: "/privacy-policy",
  },
  {
    id: "general.leave_issue2",
    href: "https://github.com/Devographics/Monorepo/issues",
  },
  {
    showIf: ({ currentUser }) => !!currentUser,
    component: <LogoutButton asLink={true} />,
  },
  {
    id: "general.help_us_translate",
    href: "https://github.com/Devographics/locale-en-US",
  },
  {
    showIf: () => publicConfig.isDev === true,
    id: "Demo survey",
    href: routes.survey.demo.href,
  },
];

export const Footer = () => {
  const [showDebug, setShowDebug] = useState(false);

  return (
    <footer className="footer">
      <div className="footer-top">
        {links.map((link, index) => (
          <LinkItem key={index} {...link} />
        ))}
      </div>
      {showDebug && <DebugZone />}
    </footer>
  );
};

const LinkWrapper = ({ children }) => (
  <span className="footer-link-item">{children}</span>
);

const LinkItem = ({
  id,
  href,
  showIf,
  component,
}: {
  id?: string;
  href?: string;
  component?: React.ReactNode;
  showIf?: ({ currentUser }: { currentUser: any }) => boolean;
}) => {
  const { currentUser } = useCurrentUser();
  if (showIf && !showIf({ currentUser })) {
    return null;
  }
  if (component) {
    return <LinkWrapper>{component}</LinkWrapper>;
  }
  if (!(id && href)) {
    throw new Error(
      "id and href are mandatory in LinkItem if 'component' is not set"
    );
  }
  const isOutboundLink = href?.includes("http");

  return (
    <LinkWrapper>
      {isOutboundLink ? (
        <a href={href}>
          <FormattedMessage id={id} />
        </a>
      ) : (
        <Link href={href}>
          <FormattedMessage id={id} />
        </Link>
      )}
    </LinkWrapper>
  );
};
export default Footer;
