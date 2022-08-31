import { useVulcanComponents } from "@vulcanjs/react-ui";
import React from "react";
import Link from "next/link";
import { useUser } from "~/account/user/hooks";
import { routes } from "~/lib/routes";
import { LogoutButton } from "~/account/user/components/LogoutButton";
import Image from "next/image";

export const Footer = () => {
  const Components = useVulcanComponents();
  const { user } = useUser();

  return (
    <footer className="footer">
      <div className="footer-top">
        &copy; 2022 <a href="https://devographics.com/">Devographics</a> |{" "}
        <Link href="/privacy-policy">
          <a>
            <Components.FormattedMessage id="general.privacy_policy" />
          </a>
        </Link>{" "}
        | <Components.FormattedMessage id="general.emoji_icons" html={true} /> |{" "}
        <Components.FormattedMessage
          id="general.leave_issue"
          values={{
            link: "https://github.com/StateOfJS/StateOfJS-Vulcan/issues",
          }}
          html={true}
        />{" "}
        |{" "}
        {!user && (
          <>
            <Link href={routes.account.login.href}>Login</Link>
          </>
        )}
        {user && (
          <>
            <LogoutButton component={"a" as const} /> |{" "}
          </>
        )}{" "}
        |{" "}
        <>
          <Link href="/admin">Admin area</Link>
        </>
      </div>
      <div className="footer-bottom">
        <a
          className="stellate-badge"
          href="https://stellate.co/?source=devographics"
        >
          <Image
            src="/stellate-badge.svg"
            width={136}
            height={60}
            alt="Powered by Stellate"
          />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
