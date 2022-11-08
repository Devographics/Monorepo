import React from "react";
import Link from "next/link";
import { useUser } from "~/account/user/hooks";
import { routes } from "~/lib/routes";
import { LogoutButton } from "~/account/user/components/LogoutButton";
import Image from "next/image";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";

export const Footer = () => {
  const { user } = useUser();

  return (
    <footer className="footer">
      <div className="footer-top">
        &copy; 2022 <a href="https://devographics.com/">Devographics</a> |{" "}
        <Link href="/privacy-policy" passHref>
          <FormattedMessage id="general.privacy_policy" />
        </Link>{" "}
        | <FormattedMessage id="general.emoji_icons" /> |{" "}
        <FormattedMessage
          id="general.leave_issue"
          values={{
            link: "https://github.com/Devographics/Monorepo/issues",
          }}
        />{" "}
        |{" "}
        {!user && (
          <>
            <Link href={routes.account.login.href}>
              <FormattedMessage id="accounts.sign_in" />
            </Link>
          </>
        )}
        {user && (
          <>
            <LogoutButton component={"a" as const} />
          </>
        )}{" "}
      </div>
      <div className="footer-bottom">
        {/* <a
          className="stellate-badge"
          href="https://stellate.co/?source=devographics"
        >
          <Image
            src="/stellate-badge.svg"
            width={136}
            height={60}
            alt="Powered by Stellate"
          />
        </a> */}
      </div>
    </footer>
  );
};

export default Footer;
