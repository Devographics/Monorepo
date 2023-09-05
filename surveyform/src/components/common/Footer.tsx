"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useCurrentUser } from "~/lib/users/hooks";
import { routes } from "~/lib/routes";
import { LogoutButton } from "~/account/user/components/LogoutButton";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { DebugZone } from "./DebugZone";

export const Footer = () => {
  const [showDebug, setShowDebug] = useState(false);
  const { currentUser } = useCurrentUser();

  return (
    <footer className="footer">
      <div className="footer-top">
        &copy; 2023 <a href="https://devographics.com/">Devographics</a> |{" "}
        {currentUser && (
          <>
            <Link href={routes.account.profile.href} passHref>
              <FormattedMessage id="nav.account" />
            </Link>{" "}
            |
          </>
        )}{" "}
        <Link href="/privacy-policy" passHref>
          <FormattedMessage id="general.privacy_policy" />
        </Link>{" "}
        {/* | <FormattedMessage id="general.emoji_icons" /> |{" "} */}
        <FormattedMessage
          id="general.leave_issue"
          values={{
            link: "https://github.com/Devographics/Monorepo/issues",
          }}
        />{" "}
        |{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setShowDebug(!showDebug);
          }}
        >
          Debug
        </a>{" "}
        | <Link href={routes.survey.demo.href}>Demo survey</Link> |{" "}
        {!currentUser && (
          <>
            <Link href={routes.account.login.href}>
              <FormattedMessage id="accounts.sign_in" />
            </Link>
          </>
        )}
        {currentUser && (
          <>
            <LogoutButton asLink={true} />
          </>
        )}
      </div>
      <div className="footer-bottom">
        {/* <a
          className="stellate-badge"
          href="https://stellate.co/?source=devographics"
        >
          <img
            src="/stellate-badge.svg"
            width={136}
            height={60}
            alt="Powered by Stellate"
          />
        </a> */}
      </div>
      {showDebug && <DebugZone />}
    </footer>
  );
};

export default Footer;
