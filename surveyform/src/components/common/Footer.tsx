"use client";
import React from "react";
import Link from "next/link";
import { useCurrentUser } from "~/lib/users/hooks";
import { routes } from "~/lib/routes";
import { LogoutButton } from "~/account/user/components/LogoutButton";
import { publicConfig } from "~/config/public";
import { useEdition } from "../SurveyContext/Provider";

import { T, useI18n } from "@devographics/react-i18n";
import { TranslatorModeButton } from "./TranslatorModeButton";
import { EditionMetadata } from "@devographics/types";

type LinkItemProps = {
  component?: React.ReactNode;
  showIf?: (args: { currentUser: any }) => boolean;
  id?: string;
  href?: (edition: EditionMetadata) => string;
};

const links: Array<LinkItemProps> = [
  {
    component:
      process.env.NEXT_PUBLIC_CONFIG === "tokyodev" ? (
        <span>
          &copy; 2024 <a href="https://tokyodev.com/">TokyoDev</a>
        </span>
      ) : (
        <span>
          &copy; 2024 <a href="https://devographics.com/">Devographics</a>
        </span>
      ),
  },
  {
    showIf: ({ currentUser }) => !!currentUser,
    id: "nav.account",
    href: () => routes.account.profile.href,
  },
  {
    showIf: ({ currentUser }) => !currentUser,
    id: "accounts.sign_in",
    href: () => routes.account.login.href,
  },
  {
    id: "general.privacy_policy",
    href: () => "/privacy-policy",
  },
  {
    id: "general.leave_issue2",
    href: (edition) =>
      edition?.issuesUrl || "https://github.com/Devographics/Monorepo/issues",
  },
  {
    showIf: ({ currentUser }) => !!currentUser,
    component: <LogoutButton asLink={true} />,
  },
  {
    id: "general.help_us_translate",
    href: (edition) => "https://github.com/Devographics/locale-en-US",
  },
  {
    showIf: () => publicConfig.isDev || publicConfig.isTest,
    // @ts-ignore
    id: "Demo survey",
    href: () => routes.survey.demo.href,
  },
  {
    showIf: () => publicConfig.isDev || publicConfig.isTest,
    // @ts-ignore
    id: "Translator mode",
    component: <TranslatorModeButton />,
  },
];

export const Footer = () => {
  const { edition } = useEdition();

  return (
    <footer className="footer">
      <div className="footer-top">
        {links.map((link, index) => (
          <LinkItem key={index} {...link} edition={edition} />
        ))}
      </div>
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
  edition,
}: LinkItemProps & {
  edition: EditionMetadata;
}) => {
  const { localizePath } = useI18n();
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
  const isOutboundLink = href(edition)?.includes("http");

  return (
    <LinkWrapper>
      {isOutboundLink ? (
        <a href={href(edition)}>
          <T token={id} fallback={id} />
        </a>
      ) : (
        <Link href={localizePath(href(edition))}>
          <T token={id} fallback={id} />
        </Link>
      )}
    </LinkWrapper>
  );
};
export default Footer;
